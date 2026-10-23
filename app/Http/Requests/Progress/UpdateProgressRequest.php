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

    public function rules(): array
    {
        return [
            'current_phase' => ['required', 'integer', 'min:1', 'max:'.(int) config('ams.progress.max_phase')],
        ];
    }
}