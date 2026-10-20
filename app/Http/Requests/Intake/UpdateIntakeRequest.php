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
            'batch_id' => ['required', 'integer', Rule::exists('batches', 'id')->whereNull('deleted_at')],
            'status' => ['required', Rule::enum(IntakeStatus::class)],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'batch_id.exists' => 'Choose an existing batch.',
        ];
    }
}