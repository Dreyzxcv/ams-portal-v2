<?php

namespace App\Policies;

use App\Models\GradeRecord;
use App\Models\User;
use App\Support\Permissions;

class GradeRecordPolicy
{
    public function viewAny(User $user): bool
    {
        return Permissions::allows($user, Permissions::GRADES_VIEW_ALL);
    }

    public function view(User $user, GradeRecord $record): bool
    {
        return ($user->isActive() && $record->trainee_id === $user->id)
            || Permissions::allows($user, Permissions::GRADES_VIEW_ALL);
    }

    public function create(User $user): bool
    {
        return Permissions::allows($user, Permissions::GRADES_MANAGE);
    }

    /** Nobody may grade themselves. */
    public function update(User $user, GradeRecord $record): bool
    {
        return Permissions::allows($user, Permissions::GRADES_MANAGE)
            && $record->trainee_id !== $user->id;
    }
}
