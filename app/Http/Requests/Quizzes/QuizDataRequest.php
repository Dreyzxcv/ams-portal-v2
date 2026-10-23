<?php

namespace App\Http\Requests\Quizzes;

use App\Support\Permissions;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

abstract class QuizDataRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Permissions::allows($this->user(), Permissions::QUIZZES_MANAGE);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'grade_component_key' => ['required', 'string', Rule::in(['phase_1', 'final_exam'])],
            'title' => ['required', 'string', 'max:150'],
            'instructions' => ['required', 'string', 'max:10000'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:65535'],
            'questions' => ['required', 'array', 'min:1', 'max:100'],
            'questions.*' => ['required', 'array:id,type,prompt,points,options,correct_option'],
            'questions.*.id' => ['sometimes', 'integer', 'min:1'],
            'questions.*.type' => ['required', 'string', Rule::in(['multiple_choice', 'paragraph'])],
            'questions.*.prompt' => ['required', 'string', 'max:10000'],
            'questions.*.points' => ['required', 'numeric', 'gt:0', 'decimal:0,2', 'max:99999.99'],
            'questions.*.options' => ['nullable', 'array', 'min:2', 'max:8'],
            'questions.*.options.*' => ['required', 'string', 'max:1000'],
            'questions.*.correct_option' => ['nullable', 'integer', 'min:0', 'max:7'],
        ];
    }

    /** @return list<Closure(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                foreach ((array) $this->input('questions', []) as $index => $question) {
                    if (! is_array($question) || ! isset($question['type'])) {
                        continue;
                    }

                    if ($question['type'] === 'multiple_choice') {
                        $options = $question['options'] ?? [];
                        $correctOption = filter_var(
                            $question['correct_option'] ?? null,
                            FILTER_VALIDATE_INT,
                        );

                        if (! is_array($options) || $correctOption === false || ! array_key_exists($correctOption, $options)) {
                            $validator->errors()->add(
                                "questions.{$index}.correct_option",
                                'Choose one of the available answer options as the correct answer.',
                            );
                        }

                        if (is_array($options)) {
                            $normalizedOptions = array_map(
                                fn ($option) => mb_strtolower(trim((string) $option)),
                                $options,
                            );

                            if (count($normalizedOptions) !== count(array_unique($normalizedOptions))) {
                                $validator->errors()->add(
                                    "questions.{$index}.options",
                                    'Answer options must be different.',
                                );
                            }
                        }
                    } elseif (
                        ($question['options'] ?? null) !== null
                        || ($question['correct_option'] ?? null) !== null
                    ) {
                        $validator->errors()->add(
                            "questions.{$index}.type",
                            'Paragraph questions cannot have answer options or an answer key.',
                        );
                    }
                }
            },
        ];
    }
}
