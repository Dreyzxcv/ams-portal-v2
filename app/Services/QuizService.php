<?php

namespace App\Services;

use App\Enums\Role;
use App\Models\GradeComponent;
use App\Models\Quiz;
use App\Models\QuizAccess;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Support\Permissions;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class QuizService
{
    private const ELIGIBLE_COMPONENTS = ['phase_1', 'final_exam'];

    public function __construct(
        private readonly AuditLogger $audit,
        private readonly GradeService $grades,
    ) {}

    /** @param array<string, mixed> $data */
    public function create(User $actor, array $data): Quiz
    {
        $this->ensureManager($actor);

        return DB::transaction(function () use ($actor, $data): Quiz {
            $componentKey = (string) $data['grade_component_key'];
            $component = $this->eligibleComponent($componentKey);

            if (Quiz::query()->where('grade_component_key', $component->key)->exists()) {
                throw ValidationException::withMessages([
                    'grade_component_key' => 'A quiz already exists for this phase.',
                ]);
            }

            $quiz = Quiz::create([
                'grade_component_key' => $component->key,
                'title' => $data['title'],
                'instructions' => $data['instructions'],
                'duration_minutes' => $data['duration_minutes'],
            ]);
            $this->saveQuestions($quiz, $data['questions']);

            $this->audit->record('quiz.created', $actor, 'quiz', $quiz->id, [
                'grade_component' => $component->key,
            ]);

            return $quiz;
        });
    }

    /** @param array<string, mixed> $data */
    public function update(User $actor, Quiz $quiz, array $data): void
    {
        $this->ensureManager($actor);

        DB::transaction(function () use ($actor, $quiz, $data): void {
            $quiz = Quiz::query()->whereKey($quiz->id)->lockForUpdate()->firstOrFail();

            if ($quiz->attempts()->exists()) {
                throw ValidationException::withMessages([
                    'quiz' => 'This quiz cannot be edited after a trainee starts an attempt.',
                ]);
            }

            $component = $this->eligibleComponent((string) $data['grade_component_key']);
            $componentAlreadyHasQuiz = Quiz::query()
                ->where('grade_component_key', $component->key)
                ->where('id', '!=', $quiz->id)
                ->exists();

            if ($componentAlreadyHasQuiz) {
                throw ValidationException::withMessages([
                    'grade_component_key' => 'A quiz already exists for this phase.',
                ]);
            }

            $quiz->update([
                'grade_component_key' => $component->key,
                'title' => $data['title'],
                'instructions' => $data['instructions'],
                'duration_minutes' => $data['duration_minutes'],
            ]);
            $quiz->questions()->delete();
            $this->saveQuestions($quiz, $data['questions']);

            $this->audit->record('quiz.updated', $actor, 'quiz', $quiz->id, [
                'grade_component' => $component->key,
            ]);
        });
    }

    public function grantAccess(User $actor, Quiz $quiz, User $trainee): void
    {
        $this->ensureManager($actor);

        if ($trainee->role !== Role::Trainee || ! $trainee->isActive()) {
            throw ValidationException::withMessages([
                'trainee_id' => 'Access can only be granted to an active trainee.',
            ]);
        }

        DB::transaction(function () use ($actor, $quiz, $trainee): void {
            Quiz::query()->whereKey($quiz->id)->lockForUpdate()->firstOrFail();
            $access = QuizAccess::query()->firstOrNew([
                'quiz_id' => $quiz->id,
                'trainee_id' => $trainee->id,
            ]);
            $wasActive = $access->exists && $access->revoked_at === null;

            if ($wasActive) {
                return;
            }

            $access->fill([
                'granted_by' => $actor->id,
                'granted_at' => now(),
                'revoked_at' => null,
            ])->save();

            $this->audit->record('quiz.access_granted', $actor, 'quiz', $quiz->id, [
                'trainee_id' => $trainee->id,
            ]);
        });
    }

    public function revokeAccess(User $actor, Quiz $quiz, User $trainee): void
    {
        $this->ensureManager($actor);

        DB::transaction(function () use ($actor, $quiz, $trainee): void {
            Quiz::query()->whereKey($quiz->id)->lockForUpdate()->firstOrFail();
            $access = $quiz->accesses()
                ->where('trainee_id', $trainee->id)
                ->whereNull('revoked_at')
                ->lockForUpdate()
                ->firstOrFail();
            $access->update(['revoked_at' => now()]);

            $this->audit->record('quiz.access_revoked', $actor, 'quiz', $quiz->id, [
                'trainee_id' => $trainee->id,
            ]);
        });
    }

    public function startAttempt(User $trainee, Quiz $quiz): QuizAttempt
    {
        if ($trainee->role !== Role::Trainee || ! $trainee->isActive()) {
            abort(403);
        }

        return DB::transaction(function () use ($trainee, $quiz): QuizAttempt {
            $quiz = Quiz::query()->whereKey($quiz->id)->lockForUpdate()->firstOrFail();
            $this->ensureActiveAccess($trainee, $quiz);

            if ($quiz->attempts()->where('trainee_id', $trainee->id)->exists()) {
                throw ValidationException::withMessages([
                    'attempt' => 'You have already used your attempt for this quiz.',
                ]);
            }

            $startedAt = now();
            $attempt = QuizAttempt::create([
                'quiz_id' => $quiz->id,
                'trainee_id' => $trainee->id,
                'started_at' => $startedAt,
                'expires_at' => $startedAt->addMinutes($quiz->duration_minutes),
            ]);

            $this->audit->record('quiz.attempt_started', $trainee, 'quiz_attempt', $attempt->id);

            return $attempt;
        });
    }

    /**
     * @param  list<array{question_id: int, selected_option?: ?int, answer_text?: ?string}>  $answers
     */
    public function saveAnswers(QuizAttempt $attempt, User $trainee, array $answers): bool
    {
        return DB::transaction(function () use ($attempt, $trainee, $answers): bool {
            $attempt = QuizAttempt::query()->whereKey($attempt->id)->lockForUpdate()->firstOrFail();

            if ($attempt->trainee_id !== $trainee->id) {
                abort(403);
            }

            if ($attempt->isSubmitted()) {
                throw ValidationException::withMessages(['attempt' => 'This attempt has already been submitted.']);
            }

            if (now()->greaterThanOrEqualTo($attempt->expires_at)) {
                $this->submitLockedAttempt($attempt);

                return false;
            }

            $this->ensureActiveAccess($trainee, $attempt->quiz);
            $this->storeAnswers($attempt, $answers);

            return true;
        });
    }

    /**
     * @param  list<array{question_id: int, selected_option?: ?int, answer_text?: ?string}>  $answers
     */
    public function submit(QuizAttempt $attempt, User $trainee, array $answers): void
    {
        DB::transaction(function () use ($attempt, $trainee, $answers): void {
            $attempt = QuizAttempt::query()->whereKey($attempt->id)->lockForUpdate()->firstOrFail();

            if ($attempt->trainee_id !== $trainee->id) {
                abort(403);
            }

            if ($attempt->isSubmitted()) {
                return;
            }

            $now = now();

            if ($now->lessThan($attempt->expires_at)) {
                $this->ensureActiveAccess($trainee, $attempt->quiz);
                $this->storeAnswers($attempt, $answers);
            }

            $this->submitLockedAttempt($attempt, $now);
        });
    }

    public function submitIfExpired(QuizAttempt $attempt): bool
    {
        return DB::transaction(function () use ($attempt): bool {
            $attempt = QuizAttempt::query()->whereKey($attempt->id)->lockForUpdate()->firstOrFail();

            if ($attempt->isSubmitted() || now()->lessThan($attempt->expires_at)) {
                return false;
            }

            $this->submitLockedAttempt($attempt);

            return true;
        });
    }

    public function submitExpiredAttempts(): int
    {
        $submitted = 0;

        QuizAttempt::query()
            ->whereNull('submitted_at')
            ->where('expires_at', '<=', now())
            ->orderBy('id')
            ->chunkById(100, function (EloquentCollection $attempts) use (&$submitted): void {
                foreach ($attempts as $attempt) {
                    if ($this->submitIfExpired($attempt)) {
                        $submitted++;
                    }
                }
            });

        return $submitted;
    }

    /**
     * @param  list<array{question_id: int, manual_score: float|string}>  $answers
     */
    public function review(User $reviewer, QuizAttempt $attempt, array $answers): void
    {
        $this->ensureManager($reviewer);

        DB::transaction(function () use ($reviewer, $attempt, $answers): void {
            $attempt = QuizAttempt::query()->whereKey($attempt->id)->lockForUpdate()->firstOrFail();

            if (! $attempt->isSubmitted()) {
                throw ValidationException::withMessages(['attempt' => 'Submit the attempt before grading it.']);
            }

            if ($attempt->isReviewed()) {
                throw ValidationException::withMessages(['attempt' => 'This attempt has already been reviewed.']);
            }

            $paragraphQuestions = $attempt->quiz->questions()
                ->where('type', 'paragraph')
                ->get()
                ->keyBy('id');
            $scoresByQuestion = collect($answers)->keyBy('question_id');

            if ($scoresByQuestion->keys()->map(fn ($id) => (int) $id)->sort()->values()->all()
                !== $paragraphQuestions->keys()->map(fn ($id) => (int) $id)->sort()->values()->all()) {
                throw ValidationException::withMessages([
                    'answers' => 'Grade every paragraph response exactly once.',
                ]);
            }

            $manualScore = 0.0;

            foreach ($paragraphQuestions as $question) {
                $score = (float) $scoresByQuestion->get($question->id)['manual_score'];

                if ($score < 0 || $score > (float) $question->points) {
                    throw ValidationException::withMessages([
                        'answers' => "The score for question {$question->position} is outside its point range.",
                    ]);
                }

                $attempt->answers()
                    ->where('quiz_question_id', $question->id)
                    ->update(['manual_score' => number_format($score, 2, '.', '')]);
                $manualScore += $score;
            }

            $quiz = $attempt->quiz()->with('gradeComponent')->firstOrFail();
            $totalPoints = (float) $quiz->questions()->sum('points');

            if ($totalPoints <= 0) {
                throw ValidationException::withMessages(['quiz' => 'This quiz has no scorable questions.']);
            }

            $rawScore = (float) $attempt->auto_score + $manualScore;
            $gradeScore = round(($rawScore / $totalPoints) * (float) $quiz->gradeComponent->max_score, 2);

            $this->grades->save(
                $reviewer,
                $attempt->trainee,
                $quiz->gradeComponent,
                $gradeScore,
                'Quiz review completed: '.$quiz->title,
            );

            $attempt->update([
                'manual_score' => number_format($manualScore, 2, '.', ''),
                'final_score' => number_format($gradeScore, 2, '.', ''),
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);

            $this->audit->record('quiz.attempt_reviewed', $reviewer, 'quiz_attempt', $attempt->id, [
                'auto_score' => $attempt->auto_score,
                'manual_score' => number_format($manualScore, 2, '.', ''),
                'grade_score' => number_format($gradeScore, 2, '.', ''),
            ]);
        });
    }

    /** @param list<array<string, mixed>> $questions */
    private function saveQuestions(Quiz $quiz, array $questions): void
    {
        foreach ($questions as $position => $question) {
            $isMultipleChoice = $question['type'] === 'multiple_choice';

            $quiz->questions()->create([
                'type' => $question['type'],
                'prompt' => $question['prompt'],
                'points' => number_format((float) $question['points'], 2, '.', ''),
                'options' => $isMultipleChoice ? array_values($question['options']) : null,
                'correct_option' => $isMultipleChoice ? (int) $question['correct_option'] : null,
                'position' => $position + 1,
            ]);
        }
    }

    /**
     * @param  list<array{question_id: int, selected_option?: ?int, answer_text?: ?string}>  $answers
     */
    private function storeAnswers(QuizAttempt $attempt, array $answers): void
    {
        $questions = $attempt->quiz->questions()->get()->keyBy('id');

        foreach ($answers as $answer) {
            $question = $questions->get((int) $answer['question_id']);

            if ($question === null) {
                throw ValidationException::withMessages(['answers' => 'An answer does not belong to this quiz.']);
            }

            $selectedOption = $answer['selected_option'] ?? null;
            $answerText = $answer['answer_text'] ?? null;

            if ($question->type === 'multiple_choice') {
                $selectedOption = filter_var($selectedOption, FILTER_VALIDATE_INT);

                if ($selectedOption === false || ! array_key_exists($selectedOption, $question->options ?? [])) {
                    throw ValidationException::withMessages(['answers' => 'Select one of the available answers.']);
                }

                $answerText = null;
            } elseif ($selectedOption !== null) {
                throw ValidationException::withMessages(['answers' => 'Paragraph answers cannot include an option.']);
            }

            QuizAnswer::query()->updateOrCreate(
                [
                    'quiz_attempt_id' => $attempt->id,
                    'quiz_question_id' => $question->id,
                ],
                [
                    'selected_option' => $selectedOption,
                    'answer_text' => $answerText,
                ],
            );
        }
    }

    private function submitLockedAttempt(QuizAttempt $attempt, ?CarbonImmutable $now = null): void
    {
        $quiz = $attempt->quiz;
        $autoScore = 0.0;

        foreach ($quiz->questions as $question) {
            $answer = $attempt->answers()->firstOrNew(['quiz_question_id' => $question->id]);

            if ($question->type === 'multiple_choice') {
                $points = (int) $answer->selected_option === (int) $question->correct_option
                    && $answer->selected_option !== null
                    ? (float) $question->points
                    : 0.0;
                $answer->auto_score = number_format($points, 2, '.', '');
                $answer->manual_score = null;
                $autoScore += $points;
            } else {
                $answer->auto_score = null;
                $answer->manual_score = null;
            }

            $answer->save();
        }

        $now ??= now();
        $submittedAt = $now->greaterThan($attempt->expires_at) ? $attempt->expires_at : $now;
        $attempt->update([
            'submitted_at' => $submittedAt,
            'auto_score' => number_format($autoScore, 2, '.', ''),
        ]);

        $this->audit->record('quiz.attempt_submitted', $attempt->trainee, 'quiz_attempt', $attempt->id, [
            'automatic_score' => number_format($autoScore, 2, '.', ''),
            'timed_out' => $submittedAt->equalTo($attempt->expires_at),
        ]);
    }

    private function eligibleComponent(string $key): GradeComponent
    {
        if (! in_array($key, self::ELIGIBLE_COMPONENTS, true)) {
            throw ValidationException::withMessages([
                'grade_component_key' => 'Quizzes are only available for Phase 1 and the Final Examination.',
            ]);
        }

        return GradeComponent::query()
            ->where('key', $key)
            ->where('active', true)
            ->lockForUpdate()
            ->firstOrFail();
    }

    private function ensureActiveAccess(User $trainee, Quiz $quiz): void
    {
        $hasAccess = $quiz->accesses()
            ->where('trainee_id', $trainee->id)
            ->whereNull('revoked_at')
            ->exists();

        if ($trainee->role !== Role::Trainee || ! $trainee->isActive() || ! $hasAccess) {
            abort(403);
        }
    }

    private function ensureManager(User $actor): void
    {
        if (! Permissions::allows($actor, Permissions::QUIZZES_MANAGE)) {
            abort(403);
        }
    }
}
