<?php

namespace App\Support;

use App\Enums\Role;
use App\Models\User;

final class Permissions
{
    public const USERS_MANAGE = 'users.manage';

    public const GRADES_VIEW_ALL = 'grades.view_all';

    public const GRADES_MANAGE = 'grades.manage';

    public const VIOLATIONS_MANAGE = 'violations.manage';

    public const PROGRESS_MANAGE = 'progress.manage';

    public const BATCHES_VIEW = 'batches.view';

    public const BATCHES_MANAGE = 'batches.manage';

    public const CERTIFICATES_MANAGE = 'certificates.manage';

    public const CHAIN_MANAGE = 'chain.manage';

    public const LOGS_VIEW = 'logs.view';

    public const SETTINGS_MANAGE = 'settings.manage';

    public const ANNOUNCEMENTS_MANAGE = 'announcements.manage';

    /** @return list<string> */
    public static function all(): array
    {
        return [
            self::USERS_MANAGE,
            self::GRADES_VIEW_ALL,
            self::GRADES_MANAGE,
            self::VIOLATIONS_MANAGE,
            self::PROGRESS_MANAGE,
            self::BATCHES_VIEW,
            self::BATCHES_MANAGE,
            self::CERTIFICATES_MANAGE,
            self::CHAIN_MANAGE,
            self::LOGS_VIEW,
            self::SETTINGS_MANAGE,
            self::ANNOUNCEMENTS_MANAGE,
        ];
    }

    /**
     * Draft matrix derived from V1's navigation rules. Trainees have no global
     * permissions: they reach only their own records, via the policies.
     *
     * @return array<string, list<string>>
     */
    public static function matrix(): array
    {
        return [
            Role::Admin->value => self::all(),
            Role::HeadInstructor->value => [
                self::GRADES_VIEW_ALL,
                self::GRADES_MANAGE,
                self::VIOLATIONS_MANAGE,
                self::PROGRESS_MANAGE,
                self::BATCHES_VIEW,
                self::ANNOUNCEMENTS_MANAGE,
            ],
            Role::Instructor->value => [
                self::GRADES_VIEW_ALL,
                self::GRADES_MANAGE,
                self::BATCHES_VIEW,
            ],
            Role::LogisticOfficer->value => [
                self::GRADES_VIEW_ALL,
                self::VIOLATIONS_MANAGE,
                self::PROGRESS_MANAGE,
            ],
            Role::Trainee->value => [],
        ];
    }

    /**
     * Permissions held by this user, for the UI only. The server still
     * authorizes every request independently.
     *
     * @return list<string>
     */
    public static function for(?User $user): array
    {
        if ($user === null || $user->role === null || ! $user->isActive()) {
            return [];
        }

        return self::matrix()[$user->role->value] ?? [];
    }

    /** Only active users hold permissions; a deactivated account is denied everything. */
    public static function allows(?User $user, string $permission): bool
    {
        if ($user === null || $user->role === null || ! $user->isActive()) {
            return false;
        }

        return in_array($permission, self::matrix()[$user->role->value] ?? [], true);
    }
}
