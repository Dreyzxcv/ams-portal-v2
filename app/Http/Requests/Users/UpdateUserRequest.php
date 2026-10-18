<?php

namespace App\Http\Requests\Users;

use App\Enums\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('user')) ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('email')) {
            $email = mb_strtolower(trim((string) $this->input('email', '')));
            $this->merge(['email' => $email === '' ? null : $email]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email:rfc', 'max:255', Rule::unique('users', 'email')->ignore($this->route('user')->id)],
            'role' => ['sometimes', 'required', Rule::enum(Role::class)],
        ];
    }
}
