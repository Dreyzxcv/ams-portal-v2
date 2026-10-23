<?php

namespace App\Http\Requests\Quizzes;

use App\Models\QuizAttempt;
use Illuminate\Foundation\Http\FormRequest;

class RecordQuizAttemptEventRequest extends FormRequest
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
            'event' => ['required', 'string', 'in:page_hidden,page_visible,window_blur,window_focus,fullscreen_entered,fullscreen_exited,fullscreen_unsupported'],
            'client_time' => ['nullable', 'date'],
        ];
    }
}
