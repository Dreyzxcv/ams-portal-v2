<?php

use App\Http\Middleware\EnsureUserIsActive;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    config([
        'broadcasting.default' => 'reverb',
        'broadcasting.connections.reverb.key' => 'test-key',
        'broadcasting.connections.reverb.secret' => 'test-secret',
        'broadcasting.connections.reverb.app_id' => 'test-app',
    ]);

    require base_path('routes/channels.php');
});

it('allows active staff to subscribe to staff updates', function () {
    $staff = User::factory()->headInstructor()->create();

    $this->actingAs($staff)
        ->postJson('/broadcasting/auth', [
            'socket_id' => '1234.5678',
            'channel_name' => 'private-staff',
        ])
        ->assertOk();
});

it('prevents trainees from subscribing to staff updates', function () {
    $trainee = User::factory()->create();

    $this->actingAs($trainee)
        ->postJson('/broadcasting/auth', [
            'socket_id' => '1234.5678',
            'channel_name' => 'private-staff',
        ])
        ->assertStatus(403);
});

it('allows active users to subscribe to quiz update signals', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/broadcasting/auth', [
            'socket_id' => '1234.5678',
            'channel_name' => 'private-active-users',
        ])
        ->assertOk();
});

it('prevents inactive users from subscribing to private user channels', function () {
    $user = User::factory()->inactive()->create();

    $this->withoutMiddleware(EnsureUserIsActive::class)
        ->actingAs($user)
        ->postJson('/broadcasting/auth', [
            'socket_id' => '1234.5678',
            'channel_name' => 'private-users.'.$user->id,
        ])
        ->assertStatus(403);
});

it('restricts private user channels to their owner', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/broadcasting/auth', [
            'socket_id' => '1234.5678',
            'channel_name' => 'private-users.'.$user->id,
        ])
        ->assertOk();
});

it('prevents a user from subscribing to another users private channel', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/broadcasting/auth', [
            'socket_id' => '1234.5678',
            'channel_name' => 'private-users.'.$otherUser->id,
        ])
        ->assertStatus(403);
});
