<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\Http\Controllers\Auth\EmailSetupController;

class SubmitEmailRequest extends FormRequest
{
    public function authorize(): bool
    {
        $state = $this->session()->get(EmailSetupController::SESSION_KEY);

        return is_array($state) && ($state['expires_at'] ?? 0) >= now()->timestamp;
    }

    protected function failedAuthorization(): void
    {
        throw new HttpResponseException(to_route('login'));
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['email' => mb_strtolower(trim((string) $this->input('email', '')))]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email:rfc', 'max:255', Rule::unique('users', 'email')],
        ];
    }
}