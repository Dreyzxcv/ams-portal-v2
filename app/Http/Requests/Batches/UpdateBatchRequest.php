<?php

namespace App\Http\Requests\Batches;

use Illuminate\Validation\Rule;

class UpdateBatchRequest extends StoreBatchRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('batch')) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', $this->uniqueName($this->route('batch')->id)],
            'starts_on' => ['nullable', 'date'],
            'ends_on' => [
                'nullable',
                'date',
                Rule::when($this->filled('starts_on'), ['after_or_equal:starts_on']),
            ],
        ];
    }
}
