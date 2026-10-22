<?php

namespace App\Http\Requests\Certificates;

use App\Models\Certificate;
use Illuminate\Foundation\Http\FormRequest;

class IssueCertificateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Certificate::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'file' => [
                'required', 'file',
                'mimes:pdf,jpg,jpeg,png,webp',
                'mimetypes:application/pdf,image/jpeg,image/png,image/webp',
                'max:5120',
            ],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'file.mimes' => 'The certificate must be a PDF, JPG, PNG or WebP file.',
            'file.mimetypes' => 'The certificate must be a PDF, JPG, PNG or WebP file.',
            'file.max' => 'The certificate must be 5 MB or smaller.',
        ];
    }
}