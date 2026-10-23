import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import {
    ArrowRight,
    ClipboardCheck,
    ClipboardList,
    Clock3,
    Hourglass,
    Play,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import QuizAttemptController from '@/actions/App/Http/Controllers/Quizzes/QuizAttemptController';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type QuizStatus = 'available' | 'in progress' | 'awaiting review' | 'graded';

type TraineeQuiz = {
    id: number;
    title: string;
    phase: string;
    duration_minutes: number;
    status: QuizStatus;
};

const statusStyles: Record<
    QuizStatus,
    {
        label: string;
        Icon: LucideIcon;
        icon: string;
        badge: string;
        action: string;
        primary: boolean;
        order: number;
    }
> = {
    'in progress': {
        label: 'In progress',
        Icon: Play,
        icon: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        action: 'Continue quiz',
        primary: true,
        order: 0,
    },
    available: {
        label: 'Available',
        Icon: ClipboardList,
        icon: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
        badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
        action: 'View quiz',
        primary: false,
        order: 1,
    },
    'awaiting review': {
        label: 'Awaiting review',
        Icon: Hourglass,
        icon: 'bg-muted text-muted-foreground',
        badge: 'bg-muted text-muted-foreground',
        action: 'View status',
        primary: false,
        order: 2,
    },
    graded: {
        label: 'Graded',
        Icon: ClipboardCheck,
        icon: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        action: 'View status',
        primary: false,
        order: 3,
    },
};

function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    if (hours === 0) {
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    }

    const h = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;

    return rest === 0 ? h : `${h} ${rest} min`;
}

export default function TraineeQuizzesIndex({
    quizzes,
}: {
    quizzes: TraineeQuiz[];
}) {
    const { auth } = usePage().props;
    const userId = auth.user?.id ?? 0;

    useEcho(
        'active-users',
        '.quizzes.changed',
        () => router.reload({ only: ['quizzes'] }),
        [],
    );
    useEcho(
        `users.${userId}`,
        '.quizzes.changed',
        () => router.reload({ only: ['quizzes'] }),
        [userId],
    );

    // Quizzes that need action come first.
    const sorted = [...quizzes].sort(
        (a, b) => statusStyles[a.status].order - statusStyles[b.status].order,
    );
    const todo = quizzes.filter(
        (q) => q.status === 'available' || q.status === 'in progress',
    ).length;

    return (
        <>
            <Head title="My quizzes" />
            <div className="mx-auto w-full max-w-5xl space-y-4 p-4 sm:p-6">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            My quizzes
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Quizzes assigned to you
                        </p>
                    </div>
                    {quizzes.length > 0 && (
                        <span
                            className={cn(
                                'rounded-full px-3 py-1 text-xs font-medium',
                                todo > 0
                                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                    : 'bg-background/70 text-muted-foreground',
                            )}
                        >
                            {todo > 0
                                ? `${todo} to take`
                                : 'Nothing to take right now'}
                        </span>
                    )}
                </header>

                <ul className="grid gap-3">
                    {sorted.map((quiz) => {
                        const s = statusStyles[quiz.status];

                        return (
                            <li key={quiz.id}>
                                <article className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-xs transition-colors hover:bg-muted/30">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl',
                                                s.icon,
                                            )}
                                        >
                                            <s.Icon className="size-5" />
                                        </span>
                                        <div className="min-w-0 space-y-1.5">
                                            <h2 className="truncate font-semibold">
                                                {quiz.title}
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                {quiz.phase}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2.5 py-1 font-medium',
                                                        s.badge,
                                                    )}
                                                >
                                                    {s.label}
                                                </span>
                                                <span className="flex items-center gap-1 text-muted-foreground">
                                                    <Clock3
                                                        className="size-3.5"
                                                        aria-hidden="true"
                                                    />
                                                    {formatDuration(
                                                        quiz.duration_minutes,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        asChild
                                        variant={
                                            s.primary ? 'default' : 'outline'
                                        }
                                        className="w-full rounded-xl sm:w-auto"
                                    >
                                        <Link
                                            href={QuizAttemptController.take(
                                                quiz.id,
                                            )}
                                        >
                                            {s.action}
                                            <ArrowRight aria-hidden="true" />
                                        </Link>
                                    </Button>
                                </article>
                            </li>
                        );
                    })}
                </ul>

                {quizzes.length === 0 && (
                    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-card px-5 py-14 text-center">
                        <ClipboardList
                            className="size-6 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <p className="font-medium">No quizzes yet</p>
                        <p className="text-sm text-muted-foreground">
                            Quizzes appear here once an instructor gives you
                            access.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}