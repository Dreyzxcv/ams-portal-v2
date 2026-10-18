<?php

namespace App\Support;

use Carbon\CarbonInterface;

final class ProgramSchedule
{
    /** Remaining days are computed, never stored. Null when the rule or start date is missing. */
    public static function remainingDays(?CarbonInterface $startedOn): ?int
    {
        $total = config('ams.progress.program_days');

        if ($total === null || $startedOn === null) {
            return null;
        }

        $elapsed = max(0, (int) floor($startedOn->startOfDay()->diffInDays(now()->startOfDay(), false)));

        return max(0, (int) $total - $elapsed);
    }
}