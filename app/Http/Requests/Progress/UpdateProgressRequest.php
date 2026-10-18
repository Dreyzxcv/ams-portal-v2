<?php

namespace App\Http\Requests\Progress;

use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Permissions::allows($this->user(), Permissions::PROGRESS_MANAGE);
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('started_on') === '') {
            $this->merge(['started_on' => null]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'current_phase' => ['required', 'integer', 'min:1', 'max:'.(int) config('ams.progress.max_phase')],
            'started_on' => ['nullable', 'date'],
        ];
    }
}