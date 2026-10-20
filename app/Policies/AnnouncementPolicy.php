<?php

namespace App\Policies;

use App\Models\Announcement;
use App\Models\User;
use App\Support\Permissions;

class AnnouncementPolicy
{
    private function manages(User $user): bool
    {
        return Permissions::allows($user, Permissions::ANNOUNCEMENTS_MANAGE);
    }

    public function viewAny(User $user): bool { return $this->manages($user); }
    public function create(User $user): bool { return $this->manages($user); }
    public function update(User $user, Announcement $a): bool { return $this->manages($user); }
    public function delete(User $user, Announcement $a): bool { return $this->manages($user); }
    public function publish(User $user, Announcement $a): bool { return $this->manages($user); }
    public function unpublish(User $user, Announcement $a): bool { return $this->manages($user); }
    public function retryDiscord(User $user, Announcement $a): bool { return $this->manages($user); }
}