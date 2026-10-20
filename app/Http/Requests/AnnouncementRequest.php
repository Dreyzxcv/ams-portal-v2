<?php

namespace App\Http\Requests;

use App\Models\Announcement;
use Illuminate\Foundation\Http\FormRequest;

class AnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (! $user) {
            return false;
        }

        return $this->isMethod('POST')
            ? $user->can('create', Announcement::class)
            : $user->can('update', $this->route('announcement'));
    }

    public function rules(): array
    {
        // Single-line fields reject newlines so they can't break the Discord/memo layout.
        $line = ['required', 'string', 'max:150', 'not_regex:/[\r\n]/'];

        return [
            'recipient' => $line,
            'sender' => $line,
            'subject' => $line,
            'body' => ['required', 'string', 'max:3000'],
            'signature' => $line,
            'publish' => ['sometimes', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'recipient' => 'To',
            'sender' => 'From',
            'subject' => 'RE',
            'body' => 'context',
            'signature' => 'name/signature',
        ];
    }
}