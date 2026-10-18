<?php

use App\Enums\Role;
use App\Enums\UserStatus;
use App\Models\AuditLog;
use App\Models\TraineeProfile;
use App\Models\TrustedDevice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

dataset('non_admins', [
    'head instructor' => ['head_instructor'],
    'instructor' => ['instructor'],
    'logistic officer' => ['logistic_officer'],
    'trainee' => ['trainee'],
]);

it('forbids every user-management action to non-admins', function (string $role) {
    $actor = User::factory()->create(['role' => $role]);
    $target = User::factory()->create();

    $this->actingAs($actor)->get('/users')->assertForbidden();
    $this->actingAs($actor)->get('/users/create')->assertForbidden();
    $this->actingAs($actor)->post('/users', ['name' => 'X', 'username' => 'xx1', 'role' => 'admin'])->assertForbidden();
    $this->actingAs($actor)->get("/users/{$target->id}/edit")->assertForbidden();
    $this->actingAs($actor)->patch("/users/{$target->id}", ['name' => 'Y'])->assertForbidden();
    $this->actingAs($actor)->patch("/users/{$target->id}/status", ['status' => 'suspended'])->assertForbidden();
    $this->actingAs($actor)->post("/users/{$target->id}/reset-password")->assertForbidden();

    expect($target->fresh()->status)->toBe(UserStatus::Active)
        ->and(User::count())->toBe(2);
})->with('non_admins');

it('sends guests to the login page', function () {
    $this->get('/users')->assertRedirect('/login');
});

it('lets an admin open the list and the create form', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get('/users')->assertOk();
    $this->actingAs($admin)->get('/users?search=zed&role=trainee&status=active')->assertOk();
    $this->actingAs($admin)->get('/users/create')->assertOk();
});

it('creates a user with a forced password change and records it without the password', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post('/users', [
        'name' => 'New Trainee',
        'username' => 'NewTrainee',
        'email' => 'New.Trainee@Example.test',
        'role' => 'trainee',
    ])->assertRedirect('/users');

    $user = User::where('username', 'newtrainee')->firstOrFail();

    expect($user->email)->toBe('new.trainee@example.test')
        ->and($user->role)->toBe(Role::Trainee)
        ->and($user->status)->toBe(UserStatus::Active)
        ->and($user->force_password_change)->toBeTrue()
        ->and(TraineeProfile::where('user_id', $user->id)->exists())->toBeTrue();

    $log = AuditLog::where('action', 'user.created')->firstOrFail();
    expect($log->actor_id)->toBe($admin->id)
        ->and(json_encode($log->details))->not->toContain('password');
});

it('allows a user without an email address', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post('/users', [
        'name' => 'No Email', 'username' => 'noemail1', 'email' => '', 'role' => 'instructor',
    ])->assertRedirect('/users');

    expect(User::where('username', 'noemail1')->first()->email)->toBeNull();
});

it('rejects duplicate usernames regardless of case, and bad input', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->create(['username' => 'jdoe', 'email' => 'jdoe@example.test']);

    $this->actingAs($admin)->post('/users', ['name' => 'A', 'username' => 'JDOE', 'role' => 'trainee'])
        ->assertSessionHasErrors('username');

    $this->actingAs($admin)->post('/users', ['name' => 'A', 'username' => 'ab', 'role' => 'trainee'])
        ->assertSessionHasErrors('username');

    $this->actingAs($admin)->post('/users', ['name' => 'A', 'username' => 'new_one', 'email' => 'JDOE@example.test', 'role' => 'trainee'])
        ->assertSessionHasErrors('email');

    $this->actingAs($admin)->post('/users', ['name' => 'A', 'username' => 'new_two', 'role' => 'wizard'])
        ->assertSessionHasErrors('role');

    expect(User::count())->toBe(2);
});

it('updates name, email and role but never the username', function () {
    $admin = User::factory()->admin()->create();
    $target = User::factory()->create(['username' => 'keepme', 'name' => 'Old']);

    $this->actingAs($admin)->patch("/users/{$target->id}", [
        'name' => 'New Name',
        'username' => 'changed',
        'role' => 'instructor',
    ])->assertRedirect("/users/{$target->id}/edit");

    $target->refresh();

    expect($target->name)->toBe('New Name')
        ->and($target->username)->toBe('keepme')
        ->and($target->role)->toBe(Role::Instructor);

    $log = AuditLog::where('action', 'user.updated')->firstOrFail();
    expect($log->details['role_from'])->toBe('trainee')
        ->and($log->details['role_to'])->toBe('instructor');
});

it('stops an admin from changing their own role or status', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->patch("/users/{$admin->id}", ['role' => 'trainee'])->assertForbidden();
    $this->actingAs($admin)->patch("/users/{$admin->id}/status", ['status' => 'inactive'])->assertForbidden();
    $this->actingAs($admin)->post("/users/{$admin->id}/reset-password")->assertForbidden();

    expect($admin->fresh()->role)->toBe(Role::Admin)
        ->and($admin->fresh()->status)->toBe(UserStatus::Active);
});

it('deactivates a user, revokes trusted devices and records it', function () {
    $admin = User::factory()->admin()->create();
    $target = User::factory()->create();

    $device = TrustedDevice::create([
        'user_id' => $target->id,
        'token_hash' => hash('sha256', 'device-token'),
        'expires_at' => now()->addDays(30),
    ]);

    $this->actingAs($admin)->patch("/users/{$target->id}/status", ['status' => 'suspended'])
        ->assertRedirect("/users/{$target->id}/edit");

    expect($target->fresh()->status)->toBe(UserStatus::Suspended)
        ->and($device->fresh()->revoked_at)->not->toBeNull();

    $log = AuditLog::where('action', 'user.status_changed')->firstOrFail();
    expect($log->details)->toMatchArray(['from' => 'active', 'to' => 'suspended']);

    $this->post('/logout');
    $this->post('/login', ['username' => $target->username, 'password' => 'password'])
        ->assertSessionHasErrors('username');
    $this->assertGuest();
});

it('rejects an invalid status value', function () {
    $admin = User::factory()->admin()->create();
    $target = User::factory()->create();

    $this->actingAs($admin)->patch("/users/{$target->id}/status", ['status' => 'banished'])
        ->assertSessionHasErrors('status');

    expect($target->fresh()->status)->toBe(UserStatus::Active);
});

it('resets a password, forces a change and keeps the new password out of the log', function () {
    $admin = User::factory()->admin()->create();
    $target = User::factory()->create();
    $oldHash = $target->password;

    $this->actingAs($admin)->post("/users/{$target->id}/reset-password")
        ->assertRedirect("/users/{$target->id}/edit");

    $target->refresh();

    expect($target->password)->not->toBe($oldHash)
        ->and(Hash::check('password', $target->password))->toBeFalse()
        ->and($target->force_password_change)->toBeTrue();

    $log = AuditLog::where('action', 'user.password_reset')->firstOrFail();
    expect($log->details)->toBeNull();
});

it('confines a user with a temporary password to the password change page', function () {
    $user = User::factory()->create(['force_password_change' => true]);

    $this->actingAs($user)->get('/dashboard')->assertRedirect(route('security.edit', absolute: false));
    $this->actingAs($user)->get('/users')->assertRedirect(route('security.edit', absolute: false));
});

it('clears the forced change once the password is updated', function () {
    $user = User::factory()->create(['force_password_change' => true]);

    $this->actingAs($user)->put('/settings/password', [
        'current_password' => 'password',
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ])->assertSessionHasNoErrors();

    expect($user->fresh()->force_password_change)->toBeFalse()
        ->and(Hash::check('new-password', $user->fresh()->password))->toBeTrue();

    $this->actingAs($user->fresh())->get('/dashboard')->assertOk();

    expect(AuditLog::where('action', 'auth.password_changed')->exists())->toBeTrue();
});
