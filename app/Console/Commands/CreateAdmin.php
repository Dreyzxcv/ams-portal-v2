<?php

namespace App\Console\Commands;

use App\Enums\Role;
use App\Enums\UserStatus;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

use function Laravel\Prompts\info;
use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

class CreateAdmin extends Command
{
    protected $signature = 'ams:create-admin';

    protected $description = 'Create an administrator account interactively (no credentials are stored in code).';

    public function handle(): int
    {
        $username = mb_strtolower(trim(text(
            label: 'Username',
            required: true,
            validate: function (string $value) {
                $value = mb_strtolower(trim($value));

                if (! preg_match('/^[a-z0-9._-]{3,50}$/', $value)) {
                    return '3 to 50 characters: letters, digits, dot, underscore or hyphen.';
                }

                if (User::withTrashed()->whereRaw('lower(username) = ?', [$value])->exists()) {
                    return 'That username is already taken.';
                }

                return null;
            },
        )));

        $name = trim(text(label: 'Display name', required: true));

        $email = mb_strtolower(trim(text(
            label: 'Email (optional, needed for password reset and OTP)',
            validate: function (string $value) {
                $value = mb_strtolower(trim($value));

                if ($value === '') {
                    return null;
                }

                if (! filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    return 'Enter a valid email address or leave blank.';
                }

                if (User::withTrashed()->whereRaw('lower(email) = ?', [$value])->exists()) {
                    return 'That email is already in use.';
                }

                return null;
            },
        )));

        $plain = password(
            label: 'Password (at least 12 characters)',
            required: true,
            validate: fn (string $value) => mb_strlen($value) < 12 ? 'Use at least 12 characters.' : null,
        );

        password(
            label: 'Confirm password',
            required: true,
            validate: fn (string $value) => $value !== $plain ? 'Passwords do not match.' : null,
        );

        $user = DB::transaction(function () use ($username, $name, $email, $plain) {
            $user = new User([
                'name' => $name,
                'username' => $username,
                'email' => $email === '' ? null : $email,
                'password' => $plain,
            ]);

            $user->forceFill([
                'role' => Role::Admin,
                'status' => UserStatus::Active,
                'force_password_change' => false,
            ])->save();

            AuditLog::create([
                'occurred_at' => now(),
                'actor_id' => null,
                'action' => 'admin.provisioned',
                'subject_type' => 'user',
                'subject_id' => (string) $user->id,
                'details' => ['username' => $username, 'via' => 'ams:create-admin'],
                'user_agent' => 'cli',
            ]);

            return $user;
        });

        info("Administrator '{$user->username}' created.");

        return self::SUCCESS;
    }
}
