<?php

use App\Models\GradeComponent;
use App\Models\GradeRecord;
use App\Models\Quiz;
use App\Models\QuizAccess;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\User;
use App\Support\Permissions;
use Database\Seeders\GradeComponentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(GradeComponentSeeder::class);
});

function quizPayload(string $componentKey = 'phase_1'): array
{
    return [
        'grade_component_key' => $componentKey,
        'title' => 'Phase assessment',
        'instructions' => 'Answer every question before the timer expires.',
        'duration_minutes' => 30,
        'questions' => [
            [
                'type' => 'multiple_choice',
                'prompt' => 'Which option is correct?',
                'points' => '2',
                'options' => ['Incorrect', 'Correct'],
                'correct_option' => 1,
            ],
            [
                'type' => 'paragraph',
                'prompt' => 'Explain your decision.',
                'points' => '3',
                'options' => null,
                'correct_option' => null,
            ],
        ],
    ];
}

function createQuiz(array $payload = []): Quiz
{
    $data = array_replace_recursive(quizPayload(), $payload);
    $quiz = Quiz::create([
        'grade_component_key' => $data['grade_component_key'],
        'title' => $data['title'],
        'instructions' => $data['instructions'],
        'duration_minutes' => $data['duration_minutes'],
    ]);

    foreach ($data['questions'] as $position => $question) {
        QuizQuestion::create([
            ...$question,
            'quiz_id' => $quiz->id,
            'position' => $position + 1,
        ]);
    }

    return $quiz;
}

it('allows quizzes only for Phase 1 and the Final Examination', function () {
    $head = User::factory()->headInstructor()->create();

    foreach (['phase_1', 'final_exam'] as $componentKey) {
        $this->actingAs($head)
            ->post(route('quizzes.store'), quizPayload($componentKey))
            ->assertRedirect();

        expect(Quiz::query()->where('grade_component_key', $componentKey)->exists())->toBeTrue();
    }

    foreach (['phase_2', 'phase_3_1', 'phase_3_2', 'phase_4'] as $componentKey) {
        $this->actingAs($head)
            ->post(route('quizzes.store'), quizPayload($componentKey))
            ->assertSessionHasErrors('grade_component_key');
    }

    expect(Quiz::query()->count())->toBe(2);
});

it('limits quiz management to admins and Head Instructors', function () {
    $quiz = createQuiz();
    $admin = User::factory()->admin()->create();
    $head = User::factory()->headInstructor()->create();
    $instructor = User::factory()->instructor()->create();
    $logisticOfficer = User::factory()->logisticOfficer()->create();

    expect($admin->can('manage', $quiz))->toBeTrue()
        ->and($head->can('manage', $quiz))->toBeTrue()
        ->and($instructor->can('manage', $quiz))->toBeFalse()
        ->and($logisticOfficer->can('manage', $quiz))->toBeFalse()
        ->and(Permissions::allows($instructor, Permissions::QUIZZES_MANAGE))->toBeFalse();

    $this->actingAs($instructor)->get(route('quizzes.index'))->assertForbidden();
    $this->actingAs($instructor)->post(route('quizzes.store'), quizPayload())->assertForbidden();
});

it('requires explicit trainee access for viewing and starting a quiz', function () {
    $quiz = createQuiz();
    $trainee = User::factory()->create();

    $this->actingAs($trainee)->get(route('quizzes.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('quizzes/trainee-index')
            ->has('quizzes', 0));

    $this->actingAs($trainee)->get(route('quizzes.take', $quiz))->assertForbidden();
    $this->actingAs($trainee)->post(route('quizzes.attempts.start', $quiz))->assertForbidden();

    expect(QuizAttempt::query()->count())->toBe(0);
});

it('hides answer keys from assigned trainees while serving the quiz attempt', function () {
    $quiz = createQuiz();
    $trainee = User::factory()->create();
    QuizAccess::create([
        'quiz_id' => $quiz->id,
        'trainee_id' => $trainee->id,
        'granted_at' => now(),
    ]);

    $this->actingAs($trainee)
        ->post(route('quizzes.attempts.start', $quiz))
        ->assertRedirect();

    $attempt = QuizAttempt::query()->firstOrFail();
    $this->actingAs($trainee)
        ->get(route('quizzes.attempts.show', $attempt))
        ->assertInertia(fn (Assert $page) => $page
            ->component('quizzes/attempt')
            ->where('quiz.questions.0.prompt', 'Which option is correct?')
            ->missing('quiz.questions.0.correct_option'));
});

it('auto-scores submitted multiple choice answers and records the grade after manual review', function () {
    $quiz = createQuiz();
    $trainee = User::factory()->create();
    $reviewer = User::factory()->headInstructor()->create();
    QuizAccess::create([
        'quiz_id' => $quiz->id,
        'trainee_id' => $trainee->id,
        'granted_at' => now(),
    ]);
    $multipleChoice = $quiz->questions()->where('type', 'multiple_choice')->firstOrFail();
    $paragraph = $quiz->questions()->where('type', 'paragraph')->firstOrFail();

    $this->actingAs($trainee)
        ->post(route('quizzes.attempts.start', $quiz))
        ->assertRedirect();
    $attempt = QuizAttempt::query()->firstOrFail();

    $answers = [
        ['question_id' => $multipleChoice->id, 'selected_option' => 1],
        ['question_id' => $paragraph->id, 'answer_text' => 'A considered response.'],
    ];
    $this->actingAs($trainee)
        ->patch(route('quizzes.attempts.answers', $attempt), ['answers' => $answers])
        ->assertRedirect();
    $this->actingAs($trainee)
        ->post(route('quizzes.attempts.submit', $attempt), ['answers' => $answers])
        ->assertRedirect();

    $attempt->refresh();
    expect((float) $attempt->auto_score)->toBe(2.0)
        ->and($attempt->submitted_at)->not->toBeNull()
        ->and($attempt->reviewed_at)->toBeNull()
        ->and(GradeRecord::query()->where('trainee_id', $trainee->id)->exists())->toBeFalse();

    expect(QuizAnswer::query()
        ->where('quiz_attempt_id', $attempt->id)
        ->where('quiz_question_id', $multipleChoice->id)
        ->value('auto_score'))->toBe('2.00');

    $this->actingAs($reviewer)
        ->put(route('quizzes.attempts.review.update', [$quiz, $attempt]), [
            'answers' => [
                ['question_id' => $paragraph->id, 'manual_score' => '1.50'],
            ],
        ])
        ->assertRedirect(route('quizzes.show', $quiz));

    $attempt->refresh();
    $grade = GradeRecord::query()
        ->where('trainee_id', $trainee->id)
        ->where('component_id', GradeComponent::query()->where('key', 'phase_1')->value('id'))
        ->firstOrFail();

    expect((float) $attempt->manual_score)->toBe(1.5)
        ->and((float) $attempt->final_score)->toBe(17.5)
        ->and($attempt->reviewed_by)->toBe($reviewer->id)
        ->and((float) $grade->score)->toBe(17.5)
        ->and($grade->graded_by)->toBe($reviewer->id);
});

it('submits expired attempts on the server and does not accept late answers', function () {
    $quiz = createQuiz();
    $quiz->update(['duration_minutes' => 1]);
    $trainee = User::factory()->create();
    QuizAccess::create([
        'quiz_id' => $quiz->id,
        'trainee_id' => $trainee->id,
        'granted_at' => now(),
    ]);
    $multipleChoice = $quiz->questions()->where('type', 'multiple_choice')->firstOrFail();

    $this->actingAs($trainee)
        ->post(route('quizzes.attempts.start', $quiz))
        ->assertRedirect();
    $attempt = QuizAttempt::query()->firstOrFail();

    $this->actingAs($trainee)
        ->patch(route('quizzes.attempts.answers', $attempt), [
            'answers' => [
                ['question_id' => $multipleChoice->id, 'selected_option' => 0],
            ],
        ])
        ->assertRedirect();

    $attempt->refresh();
    $expiration = $attempt->expires_at;
    $this->travelTo($expiration->addSecond());

    $this->artisan('quizzes:submit-expired')
        ->expectsOutput('Submitted 1 expired quiz attempt(s).')
        ->assertSuccessful();

    $attempt->refresh();
    expect($attempt->submitted_at->equalTo($expiration))->toBeTrue()
        ->and((float) $attempt->auto_score)->toBe(0.0)
        ->and($attempt->reviewed_at)->toBeNull();

    $this->actingAs($trainee)
        ->post(route('quizzes.attempts.submit', $attempt), [
            'answers' => [
                ['question_id' => $multipleChoice->id, 'selected_option' => 1],
            ],
        ])
        ->assertRedirect();

    expect((float) $attempt->fresh()->auto_score)->toBe(0.0);
});

it('re-scores saved attempts and grade-page points for phase and final quizzes after edits', function (
    string $componentKey,
    string $expectedGrade,
) {
    $quiz = createQuiz(quizPayload($componentKey));
    $trainee = User::factory()->create();
    $reviewer = User::factory()->headInstructor()->create();
    QuizAccess::create([
        'quiz_id' => $quiz->id,
        'trainee_id' => $trainee->id,
        'granted_at' => now(),
    ]);
    $this->actingAs($trainee)->post(route('quizzes.attempts.start', $quiz))->assertRedirect();
    $attempt = QuizAttempt::query()->firstOrFail();
    $multipleChoice = $quiz->questions()->where('type', 'multiple_choice')->firstOrFail();
    $paragraph = $quiz->questions()->where('type', 'paragraph')->firstOrFail();

    $answers = [
        ['question_id' => $multipleChoice->id, 'selected_option' => 0],
        ['question_id' => $paragraph->id, 'answer_text' => 'A considered response.'],
    ];
    $this->actingAs($trainee)
        ->patch(route('quizzes.attempts.answers', $attempt), ['answers' => $answers])
        ->assertRedirect();
    $this->actingAs($trainee)
        ->post(route('quizzes.attempts.submit', $attempt), ['answers' => $answers])
        ->assertRedirect();
    $this->actingAs($reviewer)
        ->put(route('quizzes.attempts.review.update', [$quiz, $attempt]), [
            'answers' => [
                ['question_id' => $paragraph->id, 'manual_score' => '1.50'],
            ],
        ])
        ->assertRedirect(route('quizzes.show', $quiz));

    $payload = quizPayload($componentKey);
    $payload['title'] = 'Corrected quiz';
    $payload['questions'][0]['id'] = $multipleChoice->id;
    $payload['questions'][0]['prompt'] = 'Corrected question prompt.';
    $payload['questions'][0]['correct_option'] = 0;
    $payload['questions'][1]['id'] = $paragraph->id;
    $payload['questions'][] = [
        'type' => 'multiple_choice',
        'prompt' => 'New question',
        'points' => '2',
        'options' => ['First', 'Second'],
        'correct_option' => 0,
    ];

    $this->actingAs($reviewer)
        ->get(route('quizzes.edit', $quiz))
        ->assertInertia(fn (Assert $page) => $page
            ->component('quizzes/form')
            ->where('attempts_started', true));

    $this->actingAs($reviewer)
        ->put(route('quizzes.update', $quiz), $payload)
        ->assertRedirect(route('quizzes.show', $quiz));

    $component = GradeComponent::query()->where('key', $componentKey)->firstOrFail();
    $attempt->refresh();
    $grade = GradeRecord::query()
        ->where('trainee_id', $trainee->id)
        ->where('component_id', $component->id)
        ->firstOrFail();

    expect((float) $attempt->auto_score)->toBe(2.0)
        ->and((float) $attempt->manual_score)->toBe(1.5)
        ->and((float) $attempt->final_score)->toBe((float) $expectedGrade)
        ->and((float) $grade->score)->toBe((float) $expectedGrade)
        ->and($quiz->questions()->count())->toBe(3);

    $this->actingAs($reviewer)
        ->get(route('grades.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('grades/index')
            ->where("trainees.data.0.scores.{$component->id}", $expectedGrade));
})->with([
    'Phase 1' => ['phase_1', '12.50'],
    'Final Examination' => ['final_exam', '50.00'],
]);

it('does not allow existing questions to be removed after an attempt starts', function () {
    $quiz = createQuiz();
    $trainee = User::factory()->create();
    QuizAccess::create([
        'quiz_id' => $quiz->id,
        'trainee_id' => $trainee->id,
        'granted_at' => now(),
    ]);
    $this->actingAs($trainee)->post(route('quizzes.attempts.start', $quiz))->assertRedirect();

    $question = $quiz->questions()->firstOrFail();
    $payload = quizPayload();
    $payload['questions'][0]['id'] = $question->id;

    $this->actingAs(User::factory()->headInstructor()->create())
        ->put(route('quizzes.update', $quiz), $payload)
        ->assertSessionHasErrors([
            'questions' => 'Existing questions cannot be removed or reordered after an attempt starts.',
        ]);

    expect($quiz->fresh()->questions()->count())->toBe(2);

    $phaseChangePayload = quizPayload('final_exam');
    foreach ($quiz->questions()->get() as $index => $existingQuestion) {
        $phaseChangePayload['questions'][$index]['id'] = $existingQuestion->id;
    }

    $this->actingAs(User::factory()->headInstructor()->create())
        ->put(route('quizzes.update', $quiz), $phaseChangePayload)
        ->assertSessionHasErrors([
            'grade_component_key' => 'A quiz phase cannot be changed after an attempt starts.',
        ]);
});

it('does not allow more than one quiz for a grade component', function () {
    $head = User::factory()->headInstructor()->create();
    $this->actingAs($head)->post(route('quizzes.store'), quizPayload())->assertRedirect();

    $this->actingAs($head)
        ->post(route('quizzes.store'), quizPayload())
        ->assertSessionHasErrors('grade_component_key');

    expect(Quiz::query()->where('grade_component_key', 'phase_1')->count())->toBe(1);
});
