<?php

namespace App\Http\Requests\Batches;

use Illuminate\Foundation\Http\FormRequest;

class AssignTraineeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('assign', $this->route('batch')) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ];
    }
}