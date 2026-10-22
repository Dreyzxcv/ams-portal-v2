import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock3, ShieldCheck } from 'lucide-react';
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

export default function QuizTake({ quiz, status }: Props) {
    return (
        <>
            <Head title={quiz.title} />
            <div className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-6">
                <header className="rounded-3xl border bg-sky-500/10 p-6">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        {quiz.title}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {quiz.phase}
                    </p>
                </header>
                <section className="space-y-5 rounded-2xl border bg-card p-6 shadow-xs">
                    <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-2">
                            <Clock3
                                className="size-4 text-muted-foreground"
                                aria-hidden="true"
                            />
                            {quiz.duration_minutes} minutes from the time you
                            start
                        </span>
                        <span className="flex items-center gap-2">
                            <ShieldCheck
                                className="size-4 text-muted-foreground"
                                aria-hidden="true"
                            />
                            Answers save as you work
                        </span>
                    </div>
                    <div className="border-t pt-4">
                        <h2 className="mb-2 font-semibold">Instructions</h2>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                            {quiz.instructions}
                        </p>
                    </div>
                    {status === 'available' ? (
                        <Form
                            {...QuizAttemptController.start.form(quiz.id)}
                            className="flex flex-wrap gap-3 border-t pt-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-xl"
                                    >
                                        {processing
                                            ? 'Starting…'
                                            : 'Start quiz'}
                                    </Button>
                                    {errors.attempt && (
                                        <p className="self-center text-sm text-destructive">
                                            {errors.attempt}
                                        </p>
                                    )}
                                </>
                            )}
                        </Form>
                    ) : (
                        <p className="border-t pt-4 text-sm">
                            This quiz has already been submitted.{' '}
                            {status === 'graded'
                                ? 'Your grade is available on the Grades page.'
                                : 'It is awaiting instructor review.'}
                        </p>
                    )}
                </section>
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
