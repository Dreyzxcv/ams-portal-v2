<?php

namespace App\Http\Controllers\Quizzes;

use App\Http\Controllers\Controller;
use App\Http\Requests\Quizzes\ReviewQuizAttemptRequest;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Services\QuizService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class QuizReviewController extends Controller
{
    public function __construct(private readonly QuizService $quizzes) {}

    public function show(Quiz $quiz, QuizAttempt $attempt): Response
    {
        Gate::authorize('grade', $attempt);
        abort_unless($attempt->quiz_id === $quiz->id, 404);
        abort_unless($attempt->isSubmitted(), 403);

        $attempt->load(['quiz.gradeComponent', 'quiz.questions', 'trainee:id,name,username', 'answers.question']);
        $totalPoints = (float) $attempt->quiz->questions->sum('points');

        return Inertia::render('quizzes/review', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'phase' => $attempt->quiz->gradeComponent->label,
                'max_score' => number_format($totalPoints, 2, '.', ''),
                'total_points' => $totalPoints,
            ],
            'trainee' => [
                'id' => $attempt->trainee->id,
                'name' => $attempt->trainee->name,
                'username' => $attempt->trainee->username,
            ],
            'attempt' => [
                'id' => $attempt->id,
                'started_at' => $attempt->started_at->toIso8601String(),
                'submitted_at' => $attempt->submitted_at->toIso8601String(),
                'auto_score' => $attempt->auto_score,
                'reviewed' => $attempt->isReviewed(),
                'final_score' => $attempt->final_score,
            ],
            'answers' => $attempt->quiz->questions->map(function ($question) use ($attempt) {
                $answer = $attempt->answers->firstWhere('quiz_question_id', $question->id);

                return [
                    'question_id' => $question->id,
                    'position' => $question->position,
                    'type' => $question->type,
                    'prompt' => $question->prompt,
                    'points' => $question->points,
                    'options' => $question->options,
                    'correct_option' => $question->correct_option,
                    'selected_option' => $answer?->selected_option,
                    'answer_text' => $answer?->answer_text,
                    'auto_score' => $answer?->auto_score,
                    'manual_score' => $answer?->manual_score,
                ];
            })->values(),
        ]);
    }

    public function update(ReviewQuizAttemptRequest $request, Quiz $quiz, QuizAttempt $attempt): RedirectResponse
    {
        $this->quizzes->review($request->user(), $attempt, $request->validated('answers', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Quiz review completed and grade recorded.')]);

        return to_route('quizzes.show', $quiz);
    }
}
