<?php

namespace App\Providers;

use App\Actions\Fortify\ResetUserPassword;
use App\Enums\OtpPurpose;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\OtpService;
use App\Services\TrustedDeviceService;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureAuthentication();
        $this->configureAuthEvents();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
    }

    /**
     * Username + password, then a one-time code unless the device is trusted.
     * Every refusal returns null, which Fortify turns into the same generic
     * "credentials do not match" error, so the response never reveals whether a
     * username exists or why a login was refused.
     */
    private function configureAuthentication(): void
    {
        Fortify::authenticateUsing(function (Request $request) {
            $username = mb_strtolower(trim((string) $request->input(Fortify::username())));
            $password = (string) $request->input('password');
            $audit = app(AuditLogger::class);

            $user = $username === ''
                ? null
                : User::query()->whereRaw('lower(username) = ?', [$username])->first();

            if ($user === null) {
                // One hash operation either way, so timing does not reveal unknown usernames.
                Hash::check($password, Hash::make(Str::random(40)));

                $audit->record('auth.login_failed', details: [
                    'reason' => 'unknown_user',
                    'username' => preg_match('/^[a-z0-9._-]{3,50}$/', $username) ? $username : '[invalid]',
                ]);

                return null;
            }

            if (! Hash::check($password, $user->password)) {
                $audit->record('auth.login_failed', null, 'user', $user->id, ['reason' => 'bad_password']);

                return null;
            }

            if (! $user->isActive()) {
                $audit->record('auth.login_blocked', null, 'user', $user->id, [
                    'reason' => 'status_'.($user->status?->value ?? 'unknown'),
                ]);

                return null;
            }

            if (! config('ams.otp.required')) {
                return $user;
            }

            if ($user->email === null) {
                $audit->record('auth.login_blocked', null, 'user', $user->id, ['reason' => 'no_email']);

                return null;
            }

            if (app(TrustedDeviceService::class)->consume($request, $user)) {
                return $user;
            }

            $result = app(OtpService::class)->issue($user, OtpPurpose::Login, $request->ip());

            if ($result === OtpService::FAILED) {
                $audit->record('auth.otp_send_failed', null, 'user', $user->id);

                return null;
            }

            if ($result === OtpService::SENT) {
                $audit->record('auth.otp_sent', null, 'user', $user->id);
            }

            $request->session()->put('otp_pending', [
                'user_id' => $user->id,
                'remember' => $request->boolean('remember'),
                'expires_at' => now()->addMinutes((int) config('ams.otp.pending_minutes'))->timestamp,
            ]);

            throw new HttpResponseException(redirect()->route('otp.show'));
        });
    }

    /**
     * Record successful logins and logouts.
     */
    private function configureAuthEvents(): void
    {
        Event::listen(Login::class, function (Login $event) {
            if ($event->user instanceof User) {
                $event->user->forceFill(['last_login_at' => now()])->saveQuietly();
                app(AuditLogger::class)->record('auth.login', $event->user, 'user', $event->user->id);
            }
        });

        Event::listen(Logout::class, function (Logout $event) {
            if ($event->user instanceof User) {
                app(AuditLogger::class)->record('auth.logout', $event->user, 'user', $event->user->id);
            }
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('login', function (Request $request) {
            $username = Str::transliterate(Str::lower((string) $request->input(Fortify::username())));

            return [
                // Slows guessing against one account from one address.
                Limit::perMinute(5)->by($username.'|'.$request->ip()),
                // Slows spraying many usernames from one address, without letting a stranger
                // lock a specific victim out (no per-username-only limit).
                Limit::perMinute(30)->by('login-ip|'.$request->ip()),
            ];
        });
    }
}