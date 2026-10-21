<?php

namespace App\Http\Requests\Intake;

use App\Enums\IntakeStatus;
use App\Models\IntakeSetting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateIntakeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', IntakeSetting::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(IntakeStatus::class)],
        ];
    }
}