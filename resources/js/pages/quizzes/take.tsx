import { Form, Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    ClipboardCheck,
    Clock3,
    Expand,
    Eye,
    Hourglass,
    Play,
    Save,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import QuizAttemptController from '@/actions/App/Http/Controllers/Quizzes/QuizAttemptController';
import QuizController from '@/actions/App/Http/Controllers/Quizzes/QuizController';
import { Button } from '@/components/ui/button';

type Props = {
    quiz: {
        id: number;
        title: string;
        phase: string;
        duration_minutes: number;
        instructions: string;
    };
    status: 'available' | 'submitted' | 'graded';
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

const rules: { Icon: LucideIcon; title: string; body: string }[] = [
    {
        Icon: Clock3,
        title: 'The timer starts right away',
        body: 'It keeps running even if you refresh or close the page. When time runs out, your answers are submitted automatically.',
    },
    {
        Icon: Save,
        title: 'Answers save as you work',
        body: 'You answer one question at a time and can go back to change earlier answers. Submission is final.',
    },
    {
        Icon: Expand,
        title: 'Fullscreen is required',
        body: 'Fullscreen starts when you press Start. If you leave it, the questions are hidden until you return. Some phones do not support fullscreen, and you can still take the quiz there.',
    },
    {
        Icon: Eye,
        title: 'Page activity is recorded',
        body: 'Leaving the page or fullscreen is logged for your instructor. It is only a record of activity, and notifications or screen locks can cause it too.',
    },
];

export default function QuizTake({ quiz, status }: Props) {
    const submitted = status !== 'available';

    return (
        <>
            <Head title={quiz.title} />
            <div className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-6">
                <header className="flex items-start gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
                        <ClipboardCheck className="size-6" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 space-y-2">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            {quiz.phase}
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            {quiz.title}
                        </h1>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 text-xs font-medium">
                            <Clock3 className="size-3.5" aria-hidden="true" />
                            {formatDuration(quiz.duration_minutes)} from the
                            time you start
                        </span>
                    </div>
                </header>

                <section className="overflow-hidden rounded-2xl border bg-card shadow-xs">
                    <div className="space-y-2 p-5 sm:p-6">
                        <h2 className="font-semibold">Instructions</h2>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                            {quiz.instructions}
                        </p>
                    </div>

                    <div className="border-t bg-muted/30 p-5 sm:p-6">
                        <h2 className="mb-4 font-semibold">Before you start</h2>
                        <ul className="grid gap-4 sm:grid-cols-2">
                            {rules.map(({ Icon, title, body }) => (
                                <li key={title} className="flex gap-3">
                                    <span
                                        aria-hidden="true"
                                        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground"
                                    >
                                        <Icon className="size-4" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">
                                            {title}
                                        </p>
                                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                            {body}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="border-t p-5 sm:p-6">
                        {status === 'available' ? (
                            <Form
                                {...QuizAttemptController.start.form(quiz.id)}
                                className="space-y-3"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                disabled={processing}
                                                className="rounded-xl"
                                                onClick={() => {
                                                    // Must run inside the click so the browser allows it.
                                                    void document.documentElement
                                                        .requestFullscreen?.()
                                                        ?.catch(
                                                            () => undefined,
                                                        );
                                                }}
                                            >
                                                <Play aria-hidden="true" />
                                                {processing
                                                    ? 'Starting…'
                                                    : 'Start quiz'}
                                            </Button>
                                            <p className="text-xs text-muted-foreground">
                                                You only get one attempt.
                                            </p>
                                        </div>
                                        {errors.attempt && (
                                            <p
                                                role="alert"
                                                className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                                            >
                                                <AlertTriangle
                                                    className="size-4 shrink-0"
                                                    aria-hidden="true"
                                                />
                                                {errors.attempt}
                                            </p>
                                        )}
                                    </>
                                )}
                            </Form>
                        ) : (
                            <div
                                role="status"
                                className="flex items-start gap-3 rounded-xl border bg-muted/40 p-4"
                            >
                                <span
                                    aria-hidden="true"
                                    className={
                                        status === 'graded'
                                            ? 'flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                            : 'flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                    }
                                >
                                    {status === 'graded' ? (
                                        <ClipboardCheck className="size-4" />
                                    ) : (
                                        <Hourglass className="size-4" />
                                    )}
                                </span>
                                <div className="text-sm">
                                    <p className="font-medium">
                                        {status === 'graded'
                                            ? 'Quiz graded'
                                            : 'Submitted, awaiting review'}
                                    </p>
                                    <p className="mt-0.5 text-muted-foreground">
                                        {status === 'graded'
                                            ? 'Your grade is available on the Grades page.'
                                            : 'Your instructor has not finished reviewing it yet.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {!submitted && (
                    <p className="px-1 text-xs text-muted-foreground">
                        Tip: close other tabs and silence notifications first,
                        so your page stays active during the quiz.
                    </p>
                )}

                <Button asChild variant="ghost" className="rounded-xl">
                    <Link href={QuizController.index()}>
                        <ArrowLeft aria-hidden="true" />
                        Back to my quizzes
                    </Link>
                </Button>
            </div>
        </>
    );
}