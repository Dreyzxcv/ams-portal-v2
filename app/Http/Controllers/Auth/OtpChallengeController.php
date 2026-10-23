<?php

namespace App\Http\Controllers\Auth;

use App\Enums\OtpPurpose;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\OtpService;
use App\Services\TrustedDeviceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OtpChallengeController extends Controller
{
    public const SESSION_KEY = 'otp_pending';

    public function show(Request $request, OtpService $otp)
    {
        $user = $this->pendingUser($request);

        if ($user === null) {
            return to_route('login');
        }

        return Inertia::render('auth/otp-challenge', [
            'email' => $this->mask((string) $user->email),
            'resend_available_at' => now()->addSeconds($otp->cooldownSeconds($user, OtpPurpose::Login))->getTimestamp(),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function verify(
        VerifyOtpRequest $request,
        OtpService $otp,
        TrustedDeviceService $devices,
        AuditLogger $audit,
    ): RedirectResponse {
        $user = $this->pendingUser($request);

        if ($user === null) {
            return to_route('login');
        }

        if (! $otp->verify($user, OtpPurpose::Login, $request->validated('code'))) {
            $audit->record('auth.otp_failed', null, 'user', $user->id);

            return back()->withErrors(['code' => __('The code is invalid or has expired.')]);
        }

        $remember = (bool) ($request->session()->get(self::SESSION_KEY)['remember'] ?? false);
        $request->session()->forget(self::SESSION_KEY);

        if ($request->boolean('trust')) {
            $devices->trust($request, $user);
            $audit->record('auth.device_trusted', $user, 'user', $user->id);
        }

        Auth::guard('web')->login($user, $remember);
        $request->session()->regenerate();

        $audit->record('auth.otp_verified', $user, 'user', $user->id);

        return redirect()->intended(config('fortify.home'));
    }

    public function resend(Request $request, OtpService $otp, AuditLogger $audit): RedirectResponse
    {
        $user = $this->pendingUser($request);

        if ($user === null) {
            return to_route('login');
        }

        $result = $otp->issue($user, OtpPurpose::Login, $request->ip());

        if ($result === OtpService::SENT) {
            $audit->record('auth.otp_resent', null, 'user', $user->id);
        }

        if ($result === OtpService::FAILED) {
            $audit->record('auth.otp_send_failed', null, 'user', $user->id);

            return back()->withErrors(['code' => __('We could not send the code. Try again shortly.')]);
        }

        if ($result === OtpService::COOLDOWN) {
            return back()->withErrors([
                'code' => __('Please wait before requesting another code.'),
            ]);
        }

        return back()->with('status', __('A new code was sent.'));
    }

    private function pendingUser(Request $request): ?User
    {
        $pending = $request->session()->get(self::SESSION_KEY);

        if (! is_array($pending) || ($pending['expires_at'] ?? 0) < now()->timestamp) {
            $request->session()->forget(self::SESSION_KEY);

            return null;
        }

        $user = User::find($pending['user_id'] ?? 0);

        if ($user === null || ! $user->isActive() || $user->email === null) {
            $request->session()->forget(self::SESSION_KEY);

            return null;
        }

        return $user;
    }

    private function mask(string $email): string
    {
        [$local, $domain] = explode('@', $email, 2) + [1 => ''];

        return mb_substr($local, 0, 1).str_repeat('*', max(mb_strlen($local) - 1, 2)).'@'.$domain;
    }
}
