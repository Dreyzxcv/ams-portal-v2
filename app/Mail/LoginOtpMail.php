<?php

namespace App\Mail;

use App\Enums\OtpPurpose;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class LoginOtpMail extends Mailable
{
    public function __construct(
        public readonly string $code,
        public readonly int $minutes,
        public readonly OtpPurpose $purpose = OtpPurpose::Login,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: match ($this->purpose) {
            OtpPurpose::EmailVerification => 'Verify your AMS Portal email',
            default => 'AMS Portal verification code',
        });
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.login-otp-html',
            text: 'emails.login-otp',
            with: $this->copy(),
        );
    }

    /** @return array{heading: string, intro: string} */
    private function copy(): array
    {
        return match ($this->purpose) {
            OtpPurpose::EmailVerification => [
                'heading' => 'Verify your email',
                'intro' => 'You are receiving this because this email address was entered while setting up an AMS Portal account. Use the code below to verify it.',
            ],
            OtpPurpose::PasswordReset, OtpPurpose::PasswordChange => [
                'heading' => 'Confirm your password change',
                'intro' => 'You are receiving this because a password change was requested for your AMS Portal account. Use the code below to continue.',
            ],
            default => [
                'heading' => 'Confirm your sign in',
                'intro' => 'You are receiving this because someone is signing in to your AMS Portal account. Use the code below to finish.',
            ],
        };
    }
}