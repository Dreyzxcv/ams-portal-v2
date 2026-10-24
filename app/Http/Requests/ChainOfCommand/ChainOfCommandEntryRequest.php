<?php

namespace App\Http\Requests\ChainOfCommand;

use App\Models\ChainOfCommandEntry;
use Illuminate\Foundation\Http\FormRequest;

class ChainOfCommandEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if ($user === null) {
            return false;
        }

        return $this->isMethod('POST')
            ? $user->can('create', ChainOfCommandEntry::class)
            : $user->can('update', $this->route('entry'));
    }

    protected function prepareForValidation(): void
    {
        $note = trim((string) $this->input('note', ''));

        $this->merge([
            'note' => $note === '' ? null : $note,
            'sort_order' => $this->filled('sort_order') ? $this->input('sort_order') : 0,
        ]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $line = ['required', 'string', 'max:150', 'not_regex:/[\r\n]/'];

        return [
            'name' => $line,
            'rank' => ['required', 'string', 'max:100', 'not_regex:/[\r\n]/'],
            'position' => $line,
            'note' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:65535'],
            'image' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'max:2048'],
            'remove_image' => ['sometimes', 'boolean'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'image.mimes' => 'The image must be a JPG, PNG or WebP file.',
            'image.mimetypes' => 'The image must be a JPG, PNG or WebP file.',
            'image.max' => 'The image must be 2 MB or smaller.',
        ];
    }
}