<?php

namespace App\Http\Controllers\Auth;

use App\Enums\OtpPurpose;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SubmitEmailRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\OtpService;
use App\Services\TrustedDeviceService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EmailSetupController extends Controller
{
    public const SESSION_KEY = 'email_setup_pending';

    public function show(Request $request): Response|RedirectResponse
    {
        $pending = $this->pending($request);

        if ($pending === null) {
            return to_route('login');
        }

        [, $state] = $pending;

        return Inertia::render('auth/email-setup', [
            'email' => $state['email'] ?? null,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(SubmitEmailRequest $request, OtpService $otp, AuditLogger $audit): RedirectResponse
    {
        $pending = $this->pending($request);

        if ($pending === null) {
            return to_route('login');
        }

        [$user, $state] = $pending;
        $email = $request->validated('email');

        $result = $otp->issue($user, OtpPurpose::EmailVerification, $request->ip(), $email);

        if ($result === OtpService::FAILED) {
            $audit->record('auth.otp_send_failed', null, 'user', $user->id);

            return back()->withErrors(['email' => __('We could not send the code. Try again shortly.')]);
        }

        if ($result === OtpService::COOLDOWN) {
            return back()->withErrors(['email' => __('A code was sent a moment ago. Please wait a minute before requesting another.')]);
        }

        // The address lives only in the server-side session until the code is verified.
        $state['email'] = $email;
        $request->session()->put(self::SESSION_KEY, $state);
        $audit->record('auth.email_otp_sent', null, 'user', $user->id);

        return to_route('email-setup.show');
    }

    public function change(Request $request): RedirectResponse
    {
        $pending = $this->pending($request);

        if ($pending === null) {
            return to_route('login');
        }

        [, $state] = $pending;
        $state['email'] = null;
        $request->session()->put(self::SESSION_KEY, $state);

        return to_route('email-setup.show');
    }

    public function verify(
        VerifyOtpRequest $request,
        OtpService $otp,
        TrustedDeviceService $devices,
        AuditLogger $audit,
    ): RedirectResponse {
        $pending = $this->pending($request);

        if ($pending === null) {
            return to_route('login');
        }

        [$user, $state] = $pending;
        $email = $state['email'] ?? null;

        if ($email === null) {
            return to_route('email-setup.show');
        }

        if (! $otp->verify($user, OtpPurpose::EmailVerification, $request->validated('code'), $email)) {
            $audit->record('auth.email_otp_failed', null, 'user', $user->id);

            return back()->withErrors(['code' => __('The code is invalid or has expired.')]);
        }

        try {
            if (User::query()->where('email', $email)->where('id', '!=', $user->id)->exists()) {
                throw new \DomainException('email taken');
            }

            $user->forceFill(['email' => $email, 'email_verified_at' => now()])->save();
        } catch (UniqueConstraintViolationException|\DomainException) {
            $state['email'] = null;
            $request->session()->put(self::SESSION_KEY, $state);

            return to_route('email-setup.show')
                ->withErrors(['email' => __('That email cannot be used. Please enter a different one.')]);
        }

        $remember = (bool) ($state['remember'] ?? false);
        $request->session()->forget(self::SESSION_KEY);

        if ($request->boolean('trust')) {
            $devices->trust($request, $user);
            $audit->record('auth.device_trusted', $user, 'user', $user->id);
        }

        Auth::guard('web')->login($user, $remember);
        $request->session()->regenerate();

        $audit->record('auth.email_verified', $user, 'user', $user->id, ['source' => 'first_login']);

        return redirect()->intended(config('fortify.home'));
    }

    public function resend(Request $request, OtpService $otp, AuditLogger $audit): RedirectResponse
    {
        $pending = $this->pending($request);

        if ($pending === null) {
            return to_route('login');
        }

        [$user, $state] = $pending;

        if (($state['email'] ?? null) === null) {
            return to_route('email-setup.show');
        }

        $result = $otp->issue($user, OtpPurpose::EmailVerification, $request->ip(), $state['email']);

        if ($result === OtpService::FAILED) {
            $audit->record('auth.otp_send_failed', null, 'user', $user->id);

            return back()->withErrors(['code' => __('We could not send the code. Try again shortly.')]);
        }

        if ($result === OtpService::SENT) {
            $audit->record('auth.email_otp_sent', null, 'user', $user->id);
        }

        return back()->with('status', __('A new code was sent if the previous one is no longer valid. Please wait a minute between requests.'));
    }

    /** @return array{0: User, 1: array<string, mixed>}|null */
    private function pending(Request $request): ?array
    {
        $state = $request->session()->get(self::SESSION_KEY);

        if (! is_array($state) || ($state['expires_at'] ?? 0) < now()->timestamp) {
            $request->session()->forget(self::SESSION_KEY);

            return null;
        }

        $user = User::find($state['user_id'] ?? 0);

        if ($user === null || ! $user->isActive() || $user->email !== null) {
            $request->session()->forget(self::SESSION_KEY);

            return null;
        }

        return [$user, $state];
    }
}