<?php

namespace App\Policies;

use App\Models\ChainOfCommandEntry;
use App\Models\User;
use App\Support\Permissions;

class ChainOfCommandEntryPolicy
{
    public function create(User $user): bool
    {
        return Permissions::allows($user, Permissions::CHAIN_MANAGE);
    }

    public function update(User $user, ChainOfCommandEntry $entry): bool
    {
        return Permissions::allows($user, Permissions::CHAIN_MANAGE);
    }

    public function delete(User $user, ChainOfCommandEntry $entry): bool
    {
        return Permissions::allows($user, Permissions::CHAIN_MANAGE);
    }
}
