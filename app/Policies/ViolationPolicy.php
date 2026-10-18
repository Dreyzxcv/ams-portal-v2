<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Violation;
use App\Support\Permissions;

class ViolationPolicy
{
    public function viewAny(User $user): bool
    {
        return Permissions::allows($user, Permissions::VIOLATIONS_MANAGE);
    }

    public function view(User $user, Violation $violation): bool
    {
        return ($user->isActive() && $violation->trainee_id === $user->id)
            || Permissions::allows($user, Permissions::VIOLATIONS_MANAGE);
    }

    public function create(User $user): bool
    {
        return Permissions::allows($user, Permissions::VIOLATIONS_MANAGE);
    }

    public function update(User $user, Violation $violation): bool
    {
        return Permissions::allows($user, Permissions::VIOLATIONS_MANAGE);
    }

    public function delete(User $user, Violation $violation): bool
    {
        return Permissions::allows($user, Permissions::VIOLATIONS_MANAGE);
    }
}
