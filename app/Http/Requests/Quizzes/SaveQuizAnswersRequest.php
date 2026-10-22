<?php

namespace App\Http\Requests\Quizzes;

use App\Models\QuizAttempt;
use Illuminate\Foundation\Http\FormRequest;

class SaveQuizAnswersRequest extends FormRequest
{
    public function authorize(): bool
    {
        $attempt = $this->route('attempt');

        return $attempt instanceof QuizAttempt
            && $this->user()?->can('attempt', $attempt->quiz) === true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'answers' => ['present', 'array', 'max:100'],
            'answers.*' => ['required', 'array:question_id,selected_option,answer_text'],
            'answers.*.question_id' => ['required', 'integer', 'distinct'],
            'answers.*.selected_option' => ['nullable', 'integer', 'min:0', 'max:7'],
            'answers.*.answer_text' => ['nullable', 'string', 'max:50000'],
        ];
    }
}
