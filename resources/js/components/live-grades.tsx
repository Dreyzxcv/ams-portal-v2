import { usePoll } from '@inertiajs/react';

/**
 * Re-fetches the given Inertia props every few seconds so new grades show up
 * without a manual refresh. Renders nothing. Needs Inertia v2.
 */
export function LiveGrades({
    only,
    interval = 3000,
}: {
    only: string[];
    interval?: number;
}) {
    usePoll(interval, { only });

    return null;
}