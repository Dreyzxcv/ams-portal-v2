<?php

namespace App\Services;

use App\Enums\OtpPurpose;
use App\Mail\LoginOtpMail;
use App\Models\OtpChallenge;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Throwable;

class OtpService
{
    public const SENT = 'sent';

    public const COOLDOWN = 'cooldown';

    public const FAILED = 'failed';

    /**
     * Creates a challenge and emails the code. $email overrides the destination for
     * addresses not yet saved on the user, and binds the code to that address.
     * Returns SENT, COOLDOWN or FAILED (nothing is stored on failure).
     */
    public function issue(User $user, OtpPurpose $purpose, ?string $ip, ?string $email = null): string
    {
        if ($this->cooldownSeconds($user, $purpose) > 0) {
            return self::COOLDOWN;
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $minutes = (int) config('ams.otp.ttl_minutes');
        $destination = $email ?? $user->email;

        if ($destination === null) {
            return self::FAILED;
        }

        try {
            DB::transaction(function () use ($user, $purpose, $ip, $code, $minutes, $email, $destination) {
                // Older unused codes are superseded.
                OtpChallenge::query()
                    ->where('user_id', $user->id)
                    ->where('purpose', $purpose->value)
                    ->whereNull('consumed_at')
                    ->update(['consumed_at' => now()]);

                OtpChallenge::create([
                    'user_id' => $user->id,
                    'purpose' => $purpose,
                    'code_hash' => $this->hash($user, $purpose, $code, $email),
                    'expires_at' => now()->addMinutes($minutes),
                    'ip_address' => $ip,
                ]);

                // If sending fails, the exception rolls the challenge back too.
                Mail::to($destination)->send(new LoginOtpMail($code, $minutes, $purpose));
            });
        } catch (Throwable $e) {
            report($e);

            return self::FAILED;
        }

        return self::SENT;
    }

    /** Checks a code. Every check counts as an attempt; a correct code is consumed. */
    public function verify(User $user, OtpPurpose $purpose, string $code, ?string $email = null): bool
    {
        return DB::transaction(function () use ($user, $purpose, $code, $email) {
            $challenge = OtpChallenge::query()
                ->where('user_id', $user->id)
                ->where('purpose', $purpose->value)
                ->whereNull('consumed_at')
                ->where('expires_at', '>', now())
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();

            if ($challenge === null || $challenge->attempts >= (int) config('ams.otp.max_attempts')) {
                return false;
            }

            $challenge->increment('attempts');

            if (! hash_equals($challenge->code_hash, $this->hash($user, $purpose, $code, $email))) {
                return false;
            }

            $challenge->forceFill(['consumed_at' => now()])->save();

            OtpChallenge::query()
                ->where('user_id', $user->id)
                ->where('purpose', $purpose->value)
                ->delete();
                
            return true;
        });
    }

    public function cooldownSeconds(User $user, OtpPurpose $purpose): int
    {
        $base = (int) config('ams.otp.resend_seconds', 60);
        $max = (int) config('ams.otp.max_resend_seconds', 900);
        $window = (int) config('ams.otp.escalation_window_minutes', 60);

        $sent = OtpChallenge::query()
            ->where('user_id', $user->id)
            ->where('purpose', $purpose->value)
            ->where('created_at', '>', now()->subMinutes($window));

        $count = (clone $sent)->count();

        if ($count === 0) {
            return 0;
        }

        $last = (clone $sent)->latest('created_at')->first()?->created_at;

        if ($last === null) {
            return 0;
        }

        $cooldown = min($base * (2 ** ($count - 1)), $max);

        return max(0, $last->getTimestamp() + $cooldown - now()->getTimestamp());
    }

    private function hash(User $user, OtpPurpose $purpose, string $code, ?string $email = null): string
    {
        $payload = $user->id.'|'.$purpose->value.'|'.$code;

        if ($email !== null) {
            $payload .= '|'.$email;
        }

        return hash_hmac('sha256', $payload, (string) config('app.key'));
    }
}