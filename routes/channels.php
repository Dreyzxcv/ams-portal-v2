<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function (User $user, int $id): bool {
    return $user->id === $id;
});

Broadcast::channel('staff', function (User $user): bool {
    return $user->isActive() && $user->isStaff();
});

Broadcast::channel('active-users', function (User $user): bool {
    return $user->isActive();
});

Broadcast::channel('users.{id}', function (User $user, int $id): bool {
    return $user->isActive() && $user->id === $id;
});
