<?php

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('logs in with the username regardless of case', function () {
    $user = User::factory()->create(['username' => 'jdoe']);

    $this->post('/login', ['username' => 'JDoe', 'password' => 'password']);

    $this->assertAuthenticatedAs($user);
});

it('does not accept the email address as a login identifier', function () {
    $user = User::factory()->create();

    $this->post('/login', ['email' => $user->email, 'password' => 'password']);

    $this->assertGuest();
});

it('refuses inactive, suspended and deleted accounts with the generic error', function (string $state) {
    $user = match ($state) {
        'inactive' => User::factory()->inactive()->create(),
        'suspended' => User::factory()->suspended()->create(),
        'deleted' => tap(User::factory()->create())->delete(),
    };

    $response = $this->post('/login', ['username' => $user->username, 'password' => 'password']);

    $response->assertSessionHasErrors('username');
    $this->assertGuest();
})->with(['inactive', 'suspended', 'deleted']);

it('gives the same error for an unknown user and a wrong password', function () {
    $user = User::factory()->create();

    $this->post('/login', ['username' => 'nobody_here', 'password' => 'whatever-123'])
        ->assertSessionHasErrors(['username' => __('auth.failed')]);

    $this->post('/login', ['username' => $user->username, 'password' => 'wrong-password'])
        ->assertSessionHasErrors(['username' => __('auth.failed')]);

    $this->assertGuest();
});

it('records a successful login and updates last_login_at', function () {
    $user = User::factory()->create();

    $this->post('/login', ['username' => $user->username, 'password' => 'password']);

    expect($user->fresh()->last_login_at)->not->toBeNull();

    $log = AuditLog::where('action', 'auth.login')->first();
    expect($log)->not->toBeNull()
        ->and($log->actor_id)->toBe($user->id)
        ->and($log->actor_username)->toBe($user->username);
});

it('records failed logins without storing the password', function () {
    $user = User::factory()->create();

    $this->post('/login', ['username' => $user->username, 'password' => 'super-secret-wrong']);

    $log = AuditLog::where('action', 'auth.login_failed')->first();
    expect($log)->not->toBeNull()
        ->and($log->details['reason'])->toBe('bad_password')
        ->and($log->subject_id)->toBe((string) $user->id)
        ->and(json_encode($log->details))->not->toContain('super-secret-wrong');
});

it('logs out a user whose account was deactivated during the session', function () {
    $user = User::factory()->inactive()->create();

    $this->actingAs($user)->get('/dashboard')->assertRedirect(route('login', absolute: false));

    $this->assertGuest();
});
