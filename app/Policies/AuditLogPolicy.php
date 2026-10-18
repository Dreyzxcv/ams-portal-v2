<?php

namespace App\Policies;

use App\Models\AuditLog;
use App\Models\User;
use App\Support\Permissions;

class AuditLogPolicy
{
    public function viewAny(User $user): bool
    {
        return Permissions::allows($user, Permissions::LOGS_VIEW);
    }

    public function view(User $user, AuditLog $log): bool
    {
        return Permissions::allows($user, Permissions::LOGS_VIEW);
    }

    // Audit rows are append-only: nobody may edit or delete them through the application.
    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, AuditLog $log): bool
    {
        return false;
    }

    public function delete(User $user, AuditLog $log): bool
    {
        return false;
    }
}
