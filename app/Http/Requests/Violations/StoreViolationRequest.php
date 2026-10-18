<?php

namespace App\Http\Requests\Violations;

use App\Models\Violation;
use Illuminate\Foundation\Http\FormRequest;

class StoreViolationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Violation::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'trainee_id' => ['required', 'integer', 'exists:users,id'],
            'occurred_on' => ['required', 'date', 'before_or_equal:today'],
            'description' => ['required', 'string', 'max:2000'],
        ];
    }
}