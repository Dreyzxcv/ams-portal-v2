import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Award, Check, ClipboardCheck, Hourglass, Send } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import GradeController from '@/actions/App/Http/Controllers/Grades/GradeController';
import QuizController from '@/actions/App/Http/Controllers/Quizzes/QuizController';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type StepState = 'done' | 'current' | 'upcoming';

type Step = {
    Icon: LucideIcon;
    title: string;
    body: string;
    state: StepState;
};

export default function QuizSubmitted({
    quiz_title,
    reviewed,
}: {
    quiz_title: string;
    reviewed: boolean;
}) {
    const { auth } = usePage().props;
    const userId = auth.user?.id ?? 0;

    useEcho(
        `users.${userId}`,
        '.quizzes.changed',
        () => router.reload({ only: ['reviewed'] }),
        [userId],
    );

    // The attempt page may have left the browser in fullscreen.
    useEffect(() => {
        if (document.fullscreenElement) {
            void document.exitFullscreen().catch(() => undefined);
        }
    }, []);

    const steps: Step[] = [
        {
            Icon: Send,
            title: 'Submitted',
            body: 'Your answers were received and saved.',
            state: 'done',
        },
        {
            Icon: Hourglass,
            title: 'Instructor review',
            body: reviewed
                ? 'Your instructor finished reviewing your answers.'
                : 'Your instructor will review your answers.',
            state: reviewed ? 'done' : 'current',
        },
        {
            Icon: Award,
            title: 'Grade recorded',
            body: reviewed
                ? 'Your grade is now on the Grades page.'
                : 'Your grade will appear on the Grades page.',
            state: reviewed ? 'done' : 'upcoming',
        },
    ];

    return (
        <>
            <Head title="Quiz submitted" />
            <div className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:p-6">
                <header className="flex flex-col items-center gap-4 rounded-3xl border bg-emerald-500/10 p-8 text-center">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                        <ClipboardCheck className="size-7" aria-hidden="true" />
                    </span>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Quiz submitted
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {quiz_title}
                        </p>
                    </div>
                    <span
                        role="status"
                        className={cn(
                            'rounded-full px-3 py-1 text-xs font-medium',
                            reviewed
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
                        )}
                    >
                        {reviewed ? 'Graded' : 'Awaiting review'}
                    </span>
                </header>

                <section
                    aria-label="Quiz progress"
                    className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6"
                >
                    <ol className="space-y-5">
                        {steps.map(({ Icon, title, body, state }, i) => (
                            <li key={title} className="relative flex gap-4">
                                {i < steps.length - 1 && (
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            'absolute top-9 left-[17px] h-[calc(100%-0.5rem)] w-px',
                                            state === 'done'
                                                ? 'bg-emerald-500/40'
                                                : 'bg-border',
                                        )}
                                    />
                                )}
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'z-10 flex size-9 shrink-0 items-center justify-center rounded-xl',
                                        state === 'done' &&
                                            'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                                        state === 'current' &&
                                            'bg-amber-500/10 text-amber-700 dark:text-amber-300',
                                        state === 'upcoming' &&
                                            'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {state === 'done' ? (
                                        <Check className="size-4" />
                                    ) : (
                                        <Icon className="size-4" />
                                    )}
                                </span>
                                <div
                                    className="min-w-0 pt-0.5"
                                    aria-current={
                                        state === 'current' ? 'step' : undefined
                                    }
                                >
                                    <p
                                        className={cn(
                                            'text-sm font-medium',
                                            state === 'upcoming' &&
                                                'text-muted-foreground',
                                        )}
                                    >
                                        {title}
                                    </p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                        {body}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <div className="flex flex-wrap justify-center gap-2">
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href={QuizController.index()}>My quizzes</Link>
                    </Button>
                    {reviewed && (
                        <Button asChild className="rounded-xl">
                            <Link href={GradeController.index()}>
                                View grades
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}