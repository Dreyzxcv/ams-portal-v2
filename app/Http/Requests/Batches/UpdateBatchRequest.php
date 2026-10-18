<?php

namespace App\Http\Requests\Batches;

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
        ];
    }
}