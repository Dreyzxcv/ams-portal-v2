import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import QuizAttemptController from '@/actions/App/Http/Controllers/Quizzes/QuizAttemptController';
import { Button } from '@/components/ui/button';
import type { QuizAttemptAnswer } from '@/types/quizzes';

type Question = {
    id: number;
    type: 'multiple_choice' | 'paragraph';
    prompt: string;
    points: string;
    options: string[] | null;
    answer_text: string | null;
    selected_option: number | null;
};

type Props = {
    attempt: { id: number; expires_at: string };
    quiz: { title: string; questions: Question[] };
};

type AnswerState = Record<
    number,
    { selected_option?: number; answer_text?: string }
>;

function makePayload(
    questions: Question[],
    answers: AnswerState,
): QuizAttemptAnswer[] {
    const payload: QuizAttemptAnswer[] = [];

    for (const question of questions) {
        const answer = answers[question.id];

        if (question.type === 'multiple_choice') {
            if (answer?.selected_option !== undefined) {
                payload.push({
                    question_id: question.id,
                    selected_option: answer.selected_option,
                });
            }

            continue;
        }

        payload.push({
            question_id: question.id,
            answer_text: answer?.answer_text ?? '',
        });
    }

    return payload;
}

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

export default function QuizAttemptPage({ attempt, quiz }: Props) {
    const [answers, setAnswers] = useState<AnswerState>(() =>
        Object.fromEntries(
            quiz.questions.map((question) => [
                question.id,
                {
                    ...(question.selected_option === null
                        ? {}
                        : { selected_option: question.selected_option }),
                    ...(question.answer_text === null
                        ? {}
                        : { answer_text: question.answer_text }),
                },
            ]),
        ),
    );
    const [secondsLeft, setSecondsLeft] = useState(() =>
        Math.max(
            0,
            Math.ceil(
                (new Date(attempt.expires_at).getTime() - Date.now()) / 1000,
            ),
        ),
    );
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const answersRef = useRef(answers);
    const submitStarted = useRef(false);
    const initialRender = useRef(true);

    answersRef.current = answers;

    const submitAttempt = useCallback(() => {
        if (submitStarted.current) {
            return;
        }

        submitStarted.current = true;
        setSubmitting(true);
        setError(null);

        router.post(
            QuizAttemptController.submit.url(attempt.id),
            { answers: makePayload(quiz.questions, answersRef.current) },
            {
                preserveScroll: true,
                onError: () => {
                    submitStarted.current = false;
                    setSubmitting(false);
                    setError(
                        'Submission failed. Your saved answers are still available; retry submission.',
                    );
                },
            },
        );
    }, [attempt.id, quiz.questions]);

    useEffect(() => {
        const updateRemainingTime = () => {
            const remaining = Math.max(
                0,
                Math.ceil(
                    (new Date(attempt.expires_at).getTime() - Date.now()) /
                        1000,
                ),
            );
            setSecondsLeft(remaining);

            if (remaining === 0) {
                submitAttempt();
            }
        };

        updateRemainingTime();
        const timer = window.setInterval(updateRemainingTime, 1000);

        return () => window.clearInterval(timer);
    }, [attempt.expires_at, submitAttempt]);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;

            return;
        }

        if (submitStarted.current) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setSaving(true);
            setSaved(false);

            router.patch(
                QuizAttemptController.saveAnswers.url(attempt.id),
                { answers: makePayload(quiz.questions, answersRef.current) },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSaving(false);
                        setSaved(true);
                    },
                    onError: () => {
                        setSaving(false);
                        setSaved(false);
                        setError(
                            'Answers could not be saved. Check your connection and try again.',
                        );
                    },
                    onFinish: () => setSaving(false),
                },
            );
        }, 700);

        return () => window.clearTimeout(timeout);
    }, [answers, attempt.id, quiz.questions]);

    return (
        <>
            <Head title={quiz.title} />
            <div className="mx-auto w-full max-w-4xl space-y-4 p-4 sm:p-6">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {quiz.title}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Your responses save automatically.
                        </p>
                    </div>
                    <div
                        role="timer"
                        aria-live="polite"
                        className="rounded-xl border bg-background px-4 py-2 text-lg font-semibold tabular-nums"
                    >
                        Time left: {formatTime(secondsLeft)}
                    </div>
                </header>

                <div
                    className="min-h-5 text-sm text-muted-foreground"
                    aria-live="polite"
                >
                    {saving
                        ? 'Saving answers…'
                        : saved
                          ? 'All changes saved.'
                          : ''}
                </div>
                {error && (
                    <p
                        role="alert"
                        className="rounded-xl border p-3 text-sm text-destructive"
                    >
                        {error}
                    </p>
                )}

                <div className="space-y-4">
                    {quiz.questions.map((question, index) => (
                        <section
                            key={question.id}
                            className="space-y-4 rounded-2xl border bg-card p-5 shadow-xs"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <h2 className="leading-relaxed font-medium">
                                    <span className="mr-2 text-muted-foreground">
                                        {index + 1}.
                                    </span>
                                    {question.prompt}
                                </h2>
                                <span className="shrink-0 text-xs text-muted-foreground">
                                    {Number(question.points)}{' '}
                                    {Number(question.points) === 1
                                        ? 'point'
                                        : 'points'}
                                </span>
                            </div>
                            {question.type === 'multiple_choice' ? (
                                <fieldset className="grid gap-2">
                                    <legend className="sr-only">
                                        Choose one answer
                                    </legend>
                                    {(question.options ?? []).map(
                                        (option, optionIndex) => (
                                            <label
                                                key={optionIndex}
                                                className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm hover:bg-muted/50"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    value={optionIndex}
                                                    checked={
                                                        answers[question.id]
                                                            ?.selected_option ===
                                                        optionIndex
                                                    }
                                                    disabled={
                                                        secondsLeft === 0 ||
                                                        submitting
                                                    }
                                                    onChange={() =>
                                                        setAnswers(
                                                            (current) => ({
                                                                ...current,
                                                                [question.id]: {
                                                                    selected_option:
                                                                        optionIndex,
                                                                },
                                                            }),
                                                        )
                                                    }
                                                    className="mt-0.5 size-4 accent-sky-600"
                                                />
                                                <span>{option}</span>
                                            </label>
                                        ),
                                    )}
                                </fieldset>
                            ) : (
                                <textarea
                                    value={
                                        answers[question.id]?.answer_text ?? ''
                                    }
                                    onChange={(event) =>
                                        setAnswers((current) => ({
                                            ...current,
                                            [question.id]: {
                                                answer_text: event.target.value,
                                            },
                                        }))
                                    }
                                    disabled={secondsLeft === 0 || submitting}
                                    maxLength={50000}
                                    rows={6}
                                    aria-label={`Response to question ${index + 1}`}
                                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                />
                            )}
                        </section>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        Submission is final. You cannot retake this quiz.
                    </p>
                    <Button
                        type="button"
                        onClick={submitAttempt}
                        disabled={submitting || secondsLeft === 0}
                        className="rounded-xl"
                    >
                        {submitting ? 'Submitting…' : 'Submit quiz'}
                    </Button>
                </div>
            </div>
        </>
    );
}
