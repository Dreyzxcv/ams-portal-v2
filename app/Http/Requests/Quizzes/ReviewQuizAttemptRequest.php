<?php

namespace App\Http\Requests\Quizzes;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ReviewQuizAttemptRequest extends FormRequest
{
    public function authorize(): bool
    {
        $attempt = $this->route('attempt');
        $quiz = $this->route('quiz');

        return $attempt instanceof QuizAttempt
            && $quiz instanceof Quiz
            && $attempt->quiz_id === $quiz->id
            && $this->user()?->can('grade', $attempt) === true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'answers' => ['sometimes', 'array', 'max:100'],
            'answers.*' => ['required', 'array:question_id,manual_score'],
            'answers.*.question_id' => ['required', 'integer', 'distinct'],
            'answers.*.manual_score' => ['required', 'numeric', 'min:0', 'decimal:0,2'],
        ];
    }

    /** @return list<Closure(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $quiz = $this->route('quiz');
                $attempt = $this->route('attempt');

                if (! $quiz instanceof Quiz || ! $attempt instanceof QuizAttempt) {
                    return;
                }

                $paragraphQuestions = $quiz->questions()->where('type', 'paragraph')->get()->keyBy('id');
                $answers = $this->input('answers', []);

                if (! is_array($answers)) {
                    return;
                }

                $received = collect($answers)->keyBy('question_id');

                foreach ($paragraphQuestions as $question) {
                    $answer = $received->get($question->id);

                    if ($answer === null) {
                        $validator->errors()->add('answers', 'Grade every paragraph response.');

                        return;
                    }

                    if ((float) $answer['manual_score'] > (float) $question->points) {
                        $validator->errors()->add(
                            'answers',
                            "The score for question {$question->position} cannot exceed {$question->points}.",
                        );

                        return;
                    }
                }

                if ($received->keys()->map(fn ($id) => (int) $id)->sort()->values()->all()
                    !== $paragraphQuestions->keys()->map(fn ($id) => (int) $id)->sort()->values()->all()) {
                    $validator->errors()->add('answers', 'Only paragraph questions can receive a manual score.');
                }
            },
        ];
    }
}
