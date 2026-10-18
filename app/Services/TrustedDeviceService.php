<?php

namespace App\Services;

use App\Models\TrustedDevice;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;

class TrustedDeviceService
{
    public const COOKIE = 'ams_device';

    /**
     * True if the request carries a valid trusted-device cookie for this user.
     * The token is rotated on every use; the original expiry date is kept.
     */
    public function consume(Request $request, User $user): bool
    {
        $token = $request->cookie(self::COOKIE);

        if (! is_string($token) || strlen($token) !== 64) {
            return false;
        }

        $device = TrustedDevice::query()
            ->where('user_id', $user->id)
            ->where('token_hash', hash('sha256', $token))
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->first();

        if ($device === null) {
            return false;
        }

        $new = $this->newToken();

        $device->forceFill([
            'token_hash' => hash('sha256', $new),
            'last_used_at' => now(),
        ])->save();

        $this->queueCookie($request, $new, $device->expires_at);

        return true;
    }

    public function trust(Request $request, User $user): void
    {
        $token = $this->newToken();
        $expires = now()->addDays((int) config('ams.otp.trusted_device_days'));

        TrustedDevice::create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $token),
            'label' => Str::limit((string) $request->userAgent(), 100, ''),
            'user_agent' => Str::limit((string) $request->userAgent(), 500, ''),
            'last_used_at' => now(),
            'expires_at' => $expires,
        ]);

        // Keep at most N active devices per user: revoke the oldest extras.
        $keep = (int) config('ams.otp.max_trusted_devices');

        TrustedDevice::query()
            ->where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->orderByDesc('id')
            ->skip($keep)
            ->take(PHP_INT_MAX)
            ->get()
            ->each(fn (TrustedDevice $extra) => $extra->forceFill(['revoked_at' => now()])->save());

        $this->queueCookie($request, $token, $expires);
    }

    public function revokeAll(User $user): void
    {
        TrustedDevice::query()
            ->where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);
    }

    private function newToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    private function queueCookie(Request $request, string $token, \DateTimeInterface $expires): void
    {
        $minutes = max(1, (int) ceil(now()->diffInMinutes($expires, false)));

        Cookie::queue(cookie(
            name: self::COOKIE,
            value: $token,
            minutes: $minutes,
            path: '/',
            domain: null,
            secure: $request->isSecure(),
            httpOnly: true,
            raw: false,
            sameSite: 'lax',
        ));
    }
}
