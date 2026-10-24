<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

it('sends the otp resend deadline as a future timestamp', function () {
    $user = User::factory()->create();

    $this->withSession(['otp_pending' => [
        'user_id' => $user->id,
        'remember' => false,
        'expires_at' => now()->addMinutes(10)->timestamp,
    ]])->get('/login/otp')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/otp-challenge')
            ->where('resend_available_at', fn ($v) => is_int($v) && $v >= now()->timestamp)
            ->missing('resend_available_in'));
});

it('sends the email setup resend deadline as a timestamp', function () {
    $user = User::factory()->create(['email' => null]);

    $this->withSession(['email_setup_pending' => [
        'user_id' => $user->id,
        'remember' => false,
        'email' => null,
        'expires_at' => now()->addMinutes(10)->timestamp,
    ]])->get('/login/email')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/email-setup')
            ->where('resend_available_at', fn ($v) => is_int($v) && $v >= now()->timestamp)
            ->missing('resend_available_in'));
});