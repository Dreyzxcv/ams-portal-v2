<?php

namespace App\Http\Requests\Violations;

use Illuminate\Foundation\Http\FormRequest;

class UpdateViolationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('violation')) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'occurred_on' => ['required', 'date', 'before_or_equal:today'],
            'description' => ['required', 'string', 'max:2000'],
        ];
    }
}