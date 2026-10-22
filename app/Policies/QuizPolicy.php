<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Support\Permissions;

class QuizPolicy
{
    public function viewAny(User $user): bool
    {
        return Permissions::allows($user, Permissions::QUIZZES_MANAGE)
            || ($user->isActive() && $user->role === Role::Trainee);
    }

    public function view(User $user, Quiz $quiz): bool
    {
        return Permissions::allows($user, Permissions::QUIZZES_MANAGE)
            || $this->hasActiveAccess($user, $quiz);
    }

    public function manage(User $user, ?Quiz $quiz = null): bool
    {
        return Permissions::allows($user, Permissions::QUIZZES_MANAGE);
    }

    public function attempt(User $user, Quiz $quiz): bool
    {
        return $this->hasActiveAccess($user, $quiz);
    }

    public function grade(User $user, QuizAttempt $attempt): bool
    {
        return Permissions::allows($user, Permissions::QUIZZES_MANAGE)
            && $attempt->trainee_id !== $user->id;
    }

    private function hasActiveAccess(User $user, Quiz $quiz): bool
    {
        return $user->isActive()
            && $user->role === Role::Trainee
            && $quiz->accesses()
                ->where('trainee_id', $user->id)
                ->whereNull('revoked_at')
                ->exists();
    }
}
