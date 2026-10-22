import { Form, Head, Link } from '@inertiajs/react';
import QuizReviewController from '@/actions/App/Http/Controllers/Quizzes/QuizReviewController';
import QuizController from '@/actions/App/Http/Controllers/Quizzes/QuizController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ReviewAnswer = {
    question_id: number;
    position: number;
    type: 'multiple_choice' | 'paragraph';
    prompt: string;
    points: string;
    options: string[] | null;
    correct_option: number | null;
    selected_option: number | null;
    answer_text: string | null;
    auto_score: string | null;
    manual_score: string | null;
};

type Props = {
    quiz: {
        id: number;
        title: string;
        phase: string;
        max_score: string;
        total_points: string;
    };
    trainee: { id: number; name: string; username: string };
    attempt: {
        id: number;
        started_at: string;
        submitted_at: string;
        auto_score: string;
        reviewed: boolean;
        final_score: string | null;
    };
    answers: ReviewAnswer[];
};

export default function QuizReview({ quiz, trainee, attempt, answers }: Props) {
    const paragraphs = answers.filter((answer) => answer.type === 'paragraph');
    const mcQuestions = answers.filter(
        (answer) => answer.type === 'multiple_choice',
    );

    return (
        <>
            <Head title={`Review: ${quiz.title}`} />
            <div className="mx-auto w-full max-w-5xl space-y-4 p-4 sm:p-6">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Review attempt
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {quiz.title} · {trainee.name} (@{trainee.username})
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href={QuizController.show(quiz.id)}>
                            Back to quiz
                        </Link>
                    </Button>
                </header>

                <section className="flex flex-wrap gap-6 rounded-2xl border bg-card p-5 text-sm shadow-xs">
                    <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p>{new Date(attempt.submitted_at).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Automatic score</p>
                        <p className="font-semibold tabular-nums">
                            {Number(attempt.auto_score)} /{' '}
                            {Number(quiz.total_points)}
                        </p>
                    </div>
                    {attempt.reviewed && (
                        <div>
                            <p className="text-muted-foreground">
                                Recorded {quiz.phase} grade
                            </p>
                            <p className="font-semibold tabular-nums">
                                {Number(attempt.final_score)} /{' '}
                                {Number(quiz.max_score)}
                            </p>
                        </div>
                    )}
                </section>

                {mcQuestions.map((answer, index) => (
                    <section
                        key={answer.question_id}
                        className="space-y-3 rounded-2xl border bg-card p-5 shadow-xs"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <h2 className="font-medium">
                                {answer.position}. {answer.prompt}
                            </h2>
                            <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                                {Number(answer.auto_score ?? 0)} /{' '}
                                {Number(answer.points)}
                            </span>
                        </div>
                        <ul className="grid gap-2 text-sm">
                            {(answer.options ?? []).map(
                                (option, optionIndex) => {
                                    const isCorrect =
                                        optionIndex === answer.correct_option;
                                    const isSelected =
                                        optionIndex === answer.selected_option;

                                    return (
                                        <li
                                            key={optionIndex}
                                            className={`rounded-xl border px-3 py-2 ${
                                                isCorrect
                                                    ? 'border-emerald-500/40 bg-emerald-500/10'
                                                    : isSelected
                                                      ? 'border-rose-500/40 bg-rose-500/10'
                                                      : ''
                                            }`}
                                        >
                                            {option}
                                            {isSelected && ' · trainee answer'}
                                            {isCorrect && ' · correct answer'}
                                        </li>
                                    );
                                },
                            )}
                        </ul>
                    </section>
                ))}

                {paragraphs.length > 0 ? (
                    <Form
                        {...QuizReviewController.update.form({
                            quiz: quiz.id,
                            attempt: attempt.id,
                        })}
                        options={{ preserveScroll: true }}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                {paragraphs.map((answer, index) => (
                                    <section
                                        key={answer.question_id}
                                        className="space-y-3 rounded-2xl border bg-card p-5 shadow-xs"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <h2 className="font-medium">
                                                {answer.position}.{' '}
                                                {answer.prompt}
                                            </h2>
                                            <span className="text-sm text-muted-foreground">
                                                Up to {Number(answer.points)}{' '}
                                                points
                                            </span>
                                        </div>
                                        <p className="min-h-20 rounded-xl bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                                            {answer.answer_text ||
                                                'No response provided.'}
                                        </p>
                                        {!attempt.reviewed && (
                                            <div className="grid max-w-xs gap-2">
                                                <label
                                                    htmlFor={`manual-score-${answer.question_id}`}
                                                    className="text-sm font-medium"
                                                >
                                                    Instructor score
                                                </label>
                                                <input
                                                    type="hidden"
                                                    name={`answers[${index}][question_id]`}
                                                    value={answer.question_id}
                                                />
                                                <Input
                                                    id={`manual-score-${answer.question_id}`}
                                                    name={`answers[${index}][manual_score]`}
                                                    type="number"
                                                    min={0}
                                                    max={Number(answer.points)}
                                                    step="0.01"
                                                    defaultValue={
                                                        answer.manual_score ??
                                                        ''
                                                    }
                                                    required
                                                    className="rounded-xl"
                                                />
                                            </div>
                                        )}
                                    </section>
                                ))}
                                <InputError message={errors.answers} />
                                <InputError message={errors.attempt} />
                                {!attempt.reviewed && (
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-sm text-muted-foreground">
                                            Completing this review records the
                                            grade automatically.
                                        </p>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-xl"
                                        >
                                            {processing
                                                ? 'Recording grade…'
                                                : 'Complete review and record grade'}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </Form>
                ) : !attempt.reviewed ? (
                    <Form
                        {...QuizReviewController.update.form({
                            quiz: quiz.id,
                            attempt: attempt.id,
                        })}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-5 shadow-xs"
                    >
                        {({ processing, errors }) => (
                            <>
                                <input type="hidden" name="answers" value="" />
                                <div>
                                    <p className="font-medium">
                                        No paragraph answers to grade
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Confirm this review to record the
                                        automatic score.
                                    </p>
                                    <InputError message={errors.answers} />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl"
                                >
                                    {processing
                                        ? 'Recording grade…'
                                        : 'Confirm review and record grade'}
                                </Button>
                            </>
                        )}
                    </Form>
                ) : null}
            </div>
        </>
    );
}
