<?php

use App\Enums\Role;
use App\Enums\UserStatus;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('profile.edit'))->assertOk();
});

test('display name can be updated', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), ['name' => 'Test User'])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    expect($user->refresh()->name)->toBe('Test User');
});

test('email, username, role and status cannot be changed from the profile page', function () {
    $user = User::factory()->create([
        'username' => 'original_user',
        'email' => 'original@example.test',
    ]);

    $this->actingAs($user)->patch(route('profile.update'), [
        'name' => 'Renamed',
        'email' => 'attacker@example.test',
        'username' => 'attacker',
        'role' => 'admin',
        'status' => 'suspended',
    ]);

    $user->refresh();

    expect($user->name)->toBe('Renamed')
        ->and($user->email)->toBe('original@example.test')
        ->and($user->username)->toBe('original_user')
        ->and($user->role)->toBe(Role::Trainee)
        ->and($user->status)->toBe(UserStatus::Active);
});

test('a profile change is recorded in the audit log', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->patch(route('profile.update'), ['name' => 'New Name']);

    $log = AuditLog::where('action', 'profile.updated')->first();

    expect($log)->not->toBeNull()
        ->and($log->actor_id)->toBe($user->id);
});

test('users cannot delete their own account', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->delete('/settings/profile', ['password' => 'password'])
        ->assertStatus(405);

    expect($user->fresh())->not->toBeNull()
        ->and($user->fresh()->trashed())->toBeFalse();
});
