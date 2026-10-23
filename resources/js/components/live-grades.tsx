import { router, usePage, usePoll } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';

export function LiveGrades({ only }: { only: string[] }) {
    const { auth } = usePage().props;
    const userId = auth.user?.id ?? 0;
    const reload = () => router.reload({ only });

    useEcho('staff', '.grades.changed', reload, [only]);
    useEcho(`users.${userId}`, '.grades.changed', reload, [only, userId]);

    return null;
}

export function LiveBatchData({
    only,
    interval = 3000,
}: {
    only: string[];
    interval?: number;
}) {
    usePoll(interval, { only });

    return null;
}
