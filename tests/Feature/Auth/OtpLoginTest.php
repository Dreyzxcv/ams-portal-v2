<?php

use App\Enums\OtpPurpose;
use App\Mail\LoginOtpMail;
use App\Models\AuditLog;
use App\Models\OtpChallenge;
use App\Models\TrustedDevice;
use App\Models\User;
use App\Services\OtpService;
use App\Services\TrustedDeviceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['ams.otp.required' => true]);
    Mail::fake();
});

function otpStartLogin(User $user)
{
    return test()->post('/login', ['username' => $user->username, 'password' => 'password']);
}

function otpSentCode(): string
{
    $code = null;

    Mail::assertSent(LoginOtpMail::class, function ($mail) use (&$code) {
        $code = $mail->code;

        return true;
    });

    return $code;
}

it('asks for a code instead of logging in after a correct password', function () {
    $user = User::factory()->create();

    otpStartLogin($user)->assertRedirect(route('otp.show', absolute: false));

    $this->assertGuest();
    Mail::assertSent(LoginOtpMail::class, fn ($mail) => $mail->hasTo($user->email));

    $code = otpSentCode();
    $challenge = OtpChallenge::firstOrFail();

    expect($code)->toMatch('/^\d{6}$/')
        ->and($challenge->code_hash)->not->toBe($code)
        ->and(strlen($challenge->code_hash))->toBe(64)
        ->and($challenge->purpose)->toBe(OtpPurpose::Login);
});

it('does not start a code flow for a wrong password', function () {
    $user = User::factory()->create();

    $this->post('/login', ['username' => $user->username, 'password' => 'wrong-password'])
        ->assertSessionHasErrors('username');

    Mail::assertNothingSent();
    expect(OtpChallenge::count())->toBe(0);
});

it('logs in with the correct code and consumes it', function () {
    $user = User::factory()->create();
    otpStartLogin($user);

    $this->post('/login/otp', ['code' => otpSentCode()])->assertRedirect();

    $this->assertAuthenticatedAs($user);
    expect(OtpChallenge::firstOrFail()->consumed_at)->not->toBeNull()
        ->and($user->fresh()->last_login_at)->not->toBeNull();

    $log = AuditLog::where('action', 'auth.otp_verified')->firstOrFail();
    expect($log->actor_id)->toBe($user->id)
        ->and(json_encode($log->details))->not->toMatch('/\d{6}/');
});

it('rejects a wrong code and counts the attempt', function () {
    $user = User::factory()->create();
    otpStartLogin($user);

    $this->post('/login/otp', ['code' => '000000'])->assertSessionHasErrors('code');

    $this->assertGuest();
    expect(OtpChallenge::firstOrFail()->attempts)->toBe(1)
        ->and(AuditLog::where('action', 'auth.otp_failed')->exists())->toBeTrue();
});

it('locks a code after five wrong attempts, even if the right code follows', function () {
    $user = User::factory()->create();
    otpStartLogin($user);
    $code = otpSentCode();
    $wrong = $code === '111111' ? '222222' : '111111';

    foreach (range(1, 5) as $attempt) {
        $this->post('/login/otp', ['code' => $wrong])->assertSessionHasErrors('code');
    }

    $this->post('/login/otp', ['code' => $code])->assertSessionHasErrors('code');
    $this->assertGuest();
});

it('rejects an expired code', function () {
    $user = User::factory()->create();
    otpStartLogin($user);
    $code = otpSentCode();

    $this->travel(6)->minutes();

    $this->post('/login/otp', ['code' => $code])->assertSessionHasErrors('code');
    $this->assertGuest();
});

it('never accepts a code twice', function () {
    $user = User::factory()->create();
    otpStartLogin($user);
    $code = otpSentCode();
    $otp = app(OtpService::class);

    expect($otp->verify($user, OtpPurpose::Login, $code))->toBeTrue()
        ->and($otp->verify($user, OtpPurpose::Login, $code))->toBeFalse();
});

it('sends nothing for an account without an email address and shows the generic error', function () {
    $user = User::factory()->create(['email' => null]);

    otpStartLogin($user)->assertSessionHasErrors('username');

    $this->assertGuest();
    Mail::assertNothingSent();
    expect(AuditLog::where('action', 'auth.login_blocked')->first()->details['reason'])->toBe('no_email');
});

it('limits resends with a cooldown', function () {
    $user = User::factory()->create();
    otpStartLogin($user);

    $this->post('/login/otp/resend');
    Mail::assertSent(LoginOtpMail::class, 1);

    $this->travel(61)->seconds();
    $this->post('/login/otp/resend');
    Mail::assertSent(LoginOtpMail::class, 2);
});

it('does not email again when the password step is repeated inside the cooldown', function () {
    $user = User::factory()->create();

    otpStartLogin($user);
    otpStartLogin($user)->assertRedirect(route('otp.show', absolute: false));

    Mail::assertSent(LoginOtpMail::class, 1);
});

it('sends a visitor without a pending login back to the login page', function () {
    $this->get('/login/otp')->assertRedirect('/login');
    $this->post('/login/otp', ['code' => '123456'])->assertRedirect('/login');
});

it('drops the pending login if the account is deactivated meanwhile', function () {
    $user = User::factory()->create();
    otpStartLogin($user);
    $code = otpSentCode();

    $user->forceFill(['status' => 'suspended'])->save();

    $this->post('/login/otp', ['code' => $code])->assertRedirect('/login');
    $this->assertGuest();
});

it('trusts a device for 30 days and skips the code on the next login', function () {
    $user = User::factory()->create();
    otpStartLogin($user);

    $response = $this->post('/login/otp', ['code' => otpSentCode(), 'trust' => 'on']);
    $this->assertAuthenticatedAs($user);

    $token = $response->getCookie(TrustedDeviceService::COOKIE)->getValue();
    $device = TrustedDevice::where('user_id', $user->id)->firstOrFail();

    expect($device->token_hash)->toBe(hash('sha256', $token))
        ->and($device->expires_at->diffInDays(now(), true))->toBeGreaterThan(29);

    $this->post('/logout');
    $this->assertGuest();

    $this->withCookie(TrustedDeviceService::COOKIE, $token)
        ->post('/login', ['username' => $user->username, 'password' => 'password'])
        ->assertRedirect('/dashboard');

    $this->assertAuthenticatedAs($user);
    expect($device->fresh()->token_hash)->not->toBe(hash('sha256', $token));
    Mail::assertSent(LoginOtpMail::class, 1);
});

it('does not trust a device unless the box was ticked', function () {
    $user = User::factory()->create();
    otpStartLogin($user);

    $this->post('/login/otp', ['code' => otpSentCode()]);

    expect(TrustedDevice::count())->toBe(0);
});

it('ignores revoked, expired and foreign device tokens', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    $revoked = bin2hex(random_bytes(32));
    TrustedDevice::create(['user_id' => $user->id, 'token_hash' => hash('sha256', $revoked), 'expires_at' => now()->addDays(5), 'revoked_at' => now()]);

    $expired = bin2hex(random_bytes(32));
    TrustedDevice::create(['user_id' => $user->id, 'token_hash' => hash('sha256', $expired), 'expires_at' => now()->subMinute()]);

    $foreign = bin2hex(random_bytes(32));
    TrustedDevice::create(['user_id' => $other->id, 'token_hash' => hash('sha256', $foreign), 'expires_at' => now()->addDays(5)]);

    foreach ([$revoked, $expired, $foreign] as $token) {
        $this->withCookie(TrustedDeviceService::COOKIE, $token)
            ->post('/login', ['username' => $user->username, 'password' => 'password'])
            ->assertRedirect(route('otp.show', absolute: false));

        $this->assertGuest();
        app('session')->flush();
        OtpChallenge::query()->update(['consumed_at' => now()]);
        $this->travel(61)->seconds();
    }
});

it('revokes trusted devices when the password is changed', function () {
    $user = User::factory()->create();
    $device = TrustedDevice::create(['user_id' => $user->id, 'token_hash' => hash('sha256', 'x'), 'expires_at' => now()->addDays(5)]);

    $this->actingAs($user)->put('/settings/password', [
        'current_password' => 'password',
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ])->assertSessionHasNoErrors();

    expect($device->fresh()->revoked_at)->not->toBeNull();
});
