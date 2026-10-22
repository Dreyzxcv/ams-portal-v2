<?php

namespace App\Http\Requests\Quizzes;

use App\Support\Permissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GrantQuizAccessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Permissions::allows($this->user(), Permissions::QUIZZES_MANAGE);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['trainee_id' => [
            'required',
            'integer',
            Rule::exists('users', 'id')->where('role', 'trainee')->where('status', 'active'),
        ]];
    }
}
