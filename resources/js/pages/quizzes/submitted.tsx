import { Head, Link } from '@inertiajs/react';
import { ClipboardCheck } from 'lucide-react';
import GradeController from '@/actions/App/Http/Controllers/Grades/GradeController';
import QuizController from '@/actions/App/Http/Controllers/Quizzes/QuizController';
import { Button } from '@/components/ui/button';

export default function QuizSubmitted({
    quiz_title,
    reviewed,
}: {
    quiz_title: string;
    reviewed: boolean;
}) {
    return (
        <>
            <Head title="Quiz submitted" />
            <div className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:p-6">
                <section className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center shadow-xs">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        <ClipboardCheck className="size-7" aria-hidden="true" />
                    </span>
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold">
                            Quiz submitted
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {quiz_title}
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {reviewed
                            ? 'Your instructor has completed the review. Your grade is on the Grades page.'
                            : 'Your answers are saved and awaiting instructor review.'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-xl"
                        >
                            <Link href={QuizController.index()}>
                                My quizzes
                            </Link>
                        </Button>
                        {reviewed && (
                            <Button asChild className="rounded-xl">
                                <Link href={GradeController.index()}>
                                    View grades
                                </Link>
                            </Button>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
