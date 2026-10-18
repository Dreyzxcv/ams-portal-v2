<?php

namespace App\Http\Requests\Grades;

use App\Models\GradeRecord;
use Illuminate\Foundation\Http\FormRequest;

class UpdateGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null
            && $user->can('create', GradeRecord::class)
            && $user->id !== $this->route('trainee')->id;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $max = (float) $this->route('component')->max_score;

        return [
            'score' => ['required', 'numeric', 'min:0', 'max:'.$max, 'decimal:0,2'],
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'score.max' => 'The score cannot be higher than the maximum for this component.',
            'score.decimal' => 'Use at most 2 decimal places.',
        ];
    }
}