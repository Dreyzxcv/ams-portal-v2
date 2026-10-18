<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return Permissions::allows($user, Permissions::USERS_MANAGE);
    }

    public function view(User $user, User $target): bool
    {
        return $user->is($target) || Permissions::allows($user, Permissions::USERS_MANAGE);
    }

    public function create(User $user): bool
    {
        return Permissions::allows($user, Permissions::USERS_MANAGE);
    }

    public function update(User $user, User $target): bool
    {
        return Permissions::allows($user, Permissions::USERS_MANAGE);
    }

    /** Admins cannot change their own role or status (prevents locking yourself out). */
    public function changeRole(User $user, User $target): bool
    {
        return Permissions::allows($user, Permissions::USERS_MANAGE) && ! $user->is($target);
    }

    public function changeStatus(User $user, User $target): bool
    {
        return Permissions::allows($user, Permissions::USERS_MANAGE) && ! $user->is($target);
    }
}
