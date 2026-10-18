<?php

namespace App\Http\Requests\Batches;

use App\Models\Batch;
use Illuminate\Foundation\Http\FormRequest;

class StoreBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Batch::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['name' => trim((string) $this->input('name', ''))]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', $this->uniqueName(null)],
            'starts_on' => ['nullable', 'date'],
        ];
    }

    protected function uniqueName(?int $ignoreId): \Closure
    {
        return function (string $attribute, mixed $value, \Closure $fail) use ($ignoreId) {
            $exists = Batch::query()
                ->whereRaw('lower(name) = ?', [mb_strtolower((string) $value)])
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists();

            if ($exists) {
                $fail('A batch with this name already exists.');
            }
        };
    }
}