import { Head, Link } from '@inertiajs/react';
import { ClipboardCheck, ClipboardList } from 'lucide-react';
import QuizAttemptController from '@/actions/App/Http/Controllers/Quizzes/QuizAttemptController';
import { Button } from '@/components/ui/button';

type TraineeQuiz = {
    id: number;
    title: string;
    phase: string;
    duration_minutes: number;
    status: 'available' | 'in progress' | 'awaiting review' | 'graded';
};

export default function TraineeQuizzesIndex({
    quizzes,
}: {
    quizzes: TraineeQuiz[];
}) {
    return (
        <>
            <Head title="My quizzes" />
            <div className="mx-auto w-full max-w-5xl space-y-4 p-4 sm:p-6">
                <div className="rounded-3xl border bg-sky-500/10 p-6">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        My quizzes
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Quizzes assigned to you
                    </p>
                </div>

                <div className="grid gap-3">
                    {quizzes.map((quiz) => (
                        <article
                            key={quiz.id}
                            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-xs"
                        >
                            <div className="flex min-w-0 items-start gap-3">
                                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
                                    {quiz.status === 'available' ? (
                                        <ClipboardList
                                            className="size-5"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <ClipboardCheck
                                            className="size-5"
                                            aria-hidden="true"
                                        />
                                    )}
                                </span>
                                <div className="min-w-0 space-y-1">
                                    <h2 className="truncate font-semibold">
                                        {quiz.title}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {quiz.phase} · {quiz.duration_minutes}{' '}
                                        minutes ·{' '}
                                        <span className="capitalize">
                                            {quiz.status}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-xl"
                            >
                                <Link
                                    href={QuizAttemptController.take(quiz.id)}
                                >
                                    {quiz.status === 'available'
                                        ? 'View quiz'
                                        : 'View status'}
                                </Link>
                            </Button>
                        </article>
                    ))}
                    {quizzes.length === 0 && (
                        <div className="rounded-2xl border bg-card px-5 py-14 text-center text-muted-foreground">
                            No quizzes have been assigned to you.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
