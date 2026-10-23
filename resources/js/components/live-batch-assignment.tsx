import { router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';

/** Reloads only the trainee props when the admin changes this trainee's batch. */
export function LiveBatchAssignment() {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const id = auth.user.id;

    useEcho(
        `users.${id}`,
        '.batch.assignment.changed',
        () => router.reload({ only: ['trainee'] }),
        [id],
    );

    return null;
}