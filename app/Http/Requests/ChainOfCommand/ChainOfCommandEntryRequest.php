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
        $url = trim((string) $this->input('image_url', ''));

        $this->merge([
            'note' => $note === '' ? null : $note,
            'image_url' => $url === '' ? null : $url,
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
            'image_url' => [
                'nullable', 'string', 'max:500', 'url:https',
                function (string $attribute, mixed $value, \Closure $fail) {
                    $parts = parse_url((string) $value);
                    $host = strtolower($parts['host'] ?? '');
                    $allowed = (array) config('ams.chain.image_hosts', []);

                    if (isset($parts['user']) || isset($parts['pass']) || isset($parts['port'])) {
                        $fail('Use a plain image link without credentials or a port.');

                        return;
                    }

                    if (! in_array($host, $allowed, true)) {
                        $fail('The image must be hosted on: '.implode(', ', $allowed).'.');

                        return;
                    }

                    if (! preg_match('/\.(jpe?g|png|webp)$/i', $parts['path'] ?? '')) {
                        $fail('Use the direct image link ending in .jpg, .png or .webp (for Imgur, right-click the image and copy the image address).');
                    }
                },
            ],
        ];
    }
}