<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;

class IntakeSettingPolicy
{
    public function view(User $user): bool
    {
        return Permissions::allows($user, Permissions::SETTINGS_MANAGE);
    }

    public function update(User $user): bool
    {
        return Permissions::allows($user, Permissions::SETTINGS_MANAGE);
    }
}