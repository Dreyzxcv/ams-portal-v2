<?php

namespace App\Policies;

use App\Models\Batch;
use App\Models\User;
use App\Support\Permissions;

class BatchPolicy
{
    public function viewAny(User $user): bool
    {
        return Permissions::allows($user, Permissions::BATCHES_VIEW)
            || Permissions::allows($user, Permissions::BATCHES_MANAGE);
    }

    /** Staff with batch access see any batch; a trainee sees only their own active batch. */
    public function view(User $user, Batch $batch): bool
    {
        if ($this->viewAny($user)) {
            return true;
        }

        return $user->isActive()
            && $batch->activeAssignments()->where('user_id', $user->id)->exists();
    }

    public function create(User $user): bool
    {
        return Permissions::allows($user, Permissions::BATCHES_MANAGE);
    }

    public function update(User $user, Batch $batch): bool
    {
        return Permissions::allows($user, Permissions::BATCHES_MANAGE);
    }

    public function delete(User $user, Batch $batch): bool
    {
        return Permissions::allows($user, Permissions::BATCHES_MANAGE);
    }

    public function assign(User $user, Batch $batch): bool
    {
        return Permissions::allows($user, Permissions::BATCHES_MANAGE);
    }
}
