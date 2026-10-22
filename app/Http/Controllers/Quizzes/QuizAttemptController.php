<?php

namespace App\Http\Controllers\Quizzes;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Quizzes\SaveQuizAnswersRequest;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Services\QuizService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class QuizAttemptController extends Controller
{
    public function __construct(private readonly QuizService $quizzes) {}

    public function take(Request $request, Quiz $quiz): Response|RedirectResponse
    {
        Gate::authorize('attempt', $quiz);
        abort_unless($request->user()->role === Role::Trainee, 403);

        $attempt = $quiz->attempts()->where('trainee_id', $request->user()->id)->first();

        if ($attempt !== null && ! $attempt->isSubmitted()) {
            return to_route('quizzes.attempts.show', $attempt);
        }

        return Inertia::render('quizzes/take', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'phase' => $quiz->gradeComponent->label,
                'duration_minutes' => $quiz->duration_minutes,
                'instructions' => $quiz->instructions,
            ],
            'status' => $attempt === null
                ? 'available'
                : ($attempt->isReviewed() ? 'graded' : 'submitted'),
        ]);
    }

    public function start(Request $request, Quiz $quiz): RedirectResponse
    {
        Gate::authorize('attempt', $quiz);
        $attempt = $this->quizzes->startAttempt($request->user(), $quiz);

        return to_route('quizzes.attempts.show', $attempt);
    }

    public function show(Request $request, QuizAttempt $attempt): Response|RedirectResponse
    {
        Gate::authorize('attempt', $attempt->quiz);
        abort_unless($attempt->trainee_id === $request->user()->id, 403);

        if (! $attempt->isSubmitted() && now()->greaterThanOrEqualTo($attempt->expires_at)) {
            $this->quizzes->submitIfExpired($attempt);
            $attempt->refresh();
        }

        if ($attempt->isSubmitted()) {
            return Inertia::render('quizzes/submitted', [
                'quiz_title' => $attempt->quiz->title,
                'reviewed' => $attempt->isReviewed(),
            ]);
        }

        $attempt->load(['quiz.questions', 'answers']);
        $answers = $attempt->answers->keyBy('quiz_question_id');

        return Inertia::render('quizzes/attempt', [
            'attempt' => [
                'id' => $attempt->id,
                'expires_at' => $attempt->expires_at->toIso8601String(),
                'answers_url' => route('quizzes.attempts.answers', $attempt),
                'submit_url' => route('quizzes.attempts.submit', $attempt),
            ],
            'quiz' => [
                'title' => $attempt->quiz->title,
                'questions' => $attempt->quiz->questions->map(fn ($question) => [
                    'id' => $question->id,
                    'type' => $question->type,
                    'prompt' => $question->prompt,
                    'points' => $question->points,
                    'options' => $question->type === 'multiple_choice' ? $question->options : null,
                    'answer_text' => $answers->get($question->id)?->answer_text,
                    'selected_option' => $answers->get($question->id)?->selected_option,
                ])->values(),
            ],
        ]);
    }

    public function saveAnswers(SaveQuizAnswersRequest $request, QuizAttempt $attempt): RedirectResponse
    {
        $this->quizzes->saveAnswers(
            $attempt,
            $request->user(),
            $request->validated('answers'),
        );

        return to_route('quizzes.attempts.show', $attempt);
    }

    public function submit(SaveQuizAnswersRequest $request, QuizAttempt $attempt): RedirectResponse
    {
        $this->quizzes->submit(
            $attempt,
            $request->user(),
            $request->validated('answers'),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Quiz submitted.')]);

        return to_route('quizzes.attempts.show', $attempt);
    }
}
