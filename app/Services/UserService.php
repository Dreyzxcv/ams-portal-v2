<?php

namespace App\Services;

use App\Enums\Role;
use App\Enums\UserStatus;
use App\Models\TraineeProfile;
use App\Models\TrustedDevice;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserService
{
    public function __construct(private readonly AuditLogger $audit) {}

    /**
     * @param  array{name: string, username: string, email?: ?string, role: string}  $data
     * @return array{0: User, 1: string} the new user and the temporary password (shown once, never stored in plain text)
     */
    public function create(User $actor, array $data): array
    {
        $temporary = $this->temporaryPassword();

        $user = DB::transaction(function () use ($actor, $data, $temporary) {
            $user = new User([
                'name' => $data['name'],
                'username' => $data['username'],
                'email' => $data['email'] ?? null,
                'password' => $temporary,
            ]);

            $user->forceFill([
                'role' => Role::from($data['role']),
                'status' => UserStatus::Active,
                'force_password_change' => true,
            ])->save();

            $this->ensureTraineeProfile($user);

            $this->audit->record('user.created', $actor, 'user', $user->id, [
                'username' => $user->username,
                'role' => $user->role->value,
            ]);

            return $user;
        });

        return [$user, $temporary];
    }

    /**
     * @param  array{name?: string, email?: ?string, role?: string}  $data
     */
    public function update(User $actor, User $target, array $data): void
    {
        DB::transaction(function () use ($actor, $target, $data) {
            $roleBefore = $target->role?->value;

            $target->fill(Arr::only($data, ['name', 'email']));

            if (isset($data['role'])) {
                $target->forceFill(['role' => Role::from($data['role'])]);
            }

            $changed = array_keys($target->getDirty());

            if ($changed === []) {
                return;
            }

            $target->save();
            $this->ensureTraineeProfile($target);

            $details = ['fields' => $changed];

            if ($roleBefore !== $target->role?->value) {
                $details['role_from'] = $roleBefore;
                $details['role_to'] = $target->role?->value;
            }

            $this->audit->record('user.updated', $actor, 'user', $target->id, $details);
        });
    }

    public function changeStatus(User $actor, User $target, UserStatus $status): void
    {
        if ($target->status === $status) {
            return;
        }

        DB::transaction(function () use ($actor, $target, $status) {
            $from = $target->status?->value;

            $target->forceFill(['status' => $status])->save();

            if ($status !== UserStatus::Active) {
                $this->revokeAccess($target);
            }

            $this->audit->record('user.status_changed', $actor, 'user', $target->id, [
                'from' => $from,
                'to' => $status->value,
            ]);
        });
    }

    /**
     * @return string the temporary password (shown once)
     */
    public function resetPassword(User $actor, User $target): string
    {
        $temporary = $this->temporaryPassword();

        DB::transaction(function () use ($actor, $target, $temporary) {
            $target->forceFill([
                'password' => $temporary,
                'force_password_change' => true,
            ])->save();

            $this->revokeAccess($target);

            // The temporary password is deliberately not part of the audit details.
            $this->audit->record('user.password_reset', $actor, 'user', $target->id);
        });

        return $temporary;
    }

    /** Ends the user's existing sessions and trusted devices. */
    private function revokeAccess(User $user): void
    {
        $user->forceFill(['remember_token' => Str::random(60)])->saveQuietly();

        TrustedDevice::where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);

        if (config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))->where('user_id', $user->id)->delete();
        }
    }

    private function ensureTraineeProfile(User $user): void
    {
        if ($user->role === Role::Trainee) {
            TraineeProfile::firstOrCreate(['user_id' => $user->id]);
        }
    }

    private function temporaryPassword(): string
    {
        return Str::password(16, symbols: false);
    }
}
