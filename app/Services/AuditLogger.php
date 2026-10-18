<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Throwable;

class AuditLogger
{
    /**
     * Never pass passwords, OTPs, tokens or other secrets in $details.
     *
     * @param  array<string, mixed>  $details
     */
    public function record(
        string $action,
        ?User $actor = null,
        ?string $subjectType = null,
        string|int|null $subjectId = null,
        array $details = [],
    ): ?AuditLog {
        $request = app()->runningInConsole() ? null : request();

        try {
            return AuditLog::create([
                'occurred_at' => now(),
                'actor_id' => $actor?->id,
                'actor_username' => $actor?->username,
                'actor_role' => $actor?->role?->value,
                'action' => $action,
                'subject_type' => $subjectType,
                'subject_id' => $subjectId === null ? null : (string) $subjectId,
                'details' => $details === [] ? null : $details,
                'ip_address' => $request?->ip(),
                'user_agent' => $request ? mb_substr((string) $request->userAgent(), 0, 500) : null,
            ]);
        } catch (Throwable $e) {
            // A logging failure must not lock everyone out, but it must not vanish either.
            report($e);

            return null;
        }
    }
}
