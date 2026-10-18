<?php

namespace App\Policies;

use App\Models\TraineeProgress;
use App\Models\User;
use App\Support\Permissions;

class TraineeProgressPolicy
{
    public function viewAny(User $user): bool
    {
        return Permissions::allows($user, Permissions::PROGRESS_MANAGE);
    }

    public function view(User $user, TraineeProgress $progress): bool
    {
        return ($user->isActive() && $progress->trainee_id === $user->id)
            || Permissions::allows($user, Permissions::PROGRESS_MANAGE);
    }

    public function update(User $user, TraineeProgress $progress): bool
    {
        return Permissions::allows($user, Permissions::PROGRESS_MANAGE);
    }
}
