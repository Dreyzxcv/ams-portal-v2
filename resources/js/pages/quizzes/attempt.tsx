import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Check,
    Clock3,
    Expand,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import QuizAttemptController from '@/actions/App/Http/Controllers/Quizzes/QuizAttemptController';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { QuizAttemptAnswer, QuizAttemptEvent } from '@/types/quizzes';

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
    attempt: { id: number; expires_at: string; server_time: string };
    quiz: { title: string; questions: Question[] };
};

type AnswerState = Record<
    number,
    { selected_option?: number; answer_text?: string }
>;

type SaveState = 'saved' | 'unsaved' | 'saving' | 'error';

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

function isAnswered(question: Question, answers: AnswerState): boolean {
    const answer = answers[question.id];

    return question.type === 'multiple_choice'
        ? answer?.selected_option !== undefined
        : (answer?.answer_text ?? '').trim() !== '';
}

/** HH:MM:SS from one hour up, otherwise MM:SS. */
function formatTime(totalSeconds: number): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return totalSeconds >= 3600
        ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
        : `${pad(minutes)}:${pad(seconds)}`;
}

function xsrfToken(): string {
    const raw = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    return raw ? decodeURIComponent(raw) : '';
}

function SaveStatus({
    state,
    onRetry,
}: {
    state: SaveState;
    onRetry: () => void;
}) {
    if (state === 'error') {
        return (
            <span
                role="status"
                className="flex items-center gap-2 text-xs text-destructive"
            >
                <AlertTriangle className="size-3.5" aria-hidden="true" />
                Not saved
                <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-2 py-0.5 font-medium hover:bg-destructive/10"
                >
                    <RefreshCw className="size-3" aria-hidden="true" />
                    Retry
                </button>
            </span>
        );
    }

    return (
        <span
            role="status"
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
            {state === 'saving' && (
                <>
                    <Loader2
                        className="size-3.5 animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                    />
                    Saving…
                </>
            )}
            {state === 'saved' && (
                <>
                    <Check
                        className="size-3.5 text-emerald-600 dark:text-emerald-400"
                        aria-hidden="true"
                    />
                    Saved
                </>
            )}
            {state === 'unsaved' && 'Unsaved changes'}
        </span>
    );
}

export default function QuizAttemptPage({ attempt, quiz }: Props) {
    const { questions } = quiz;

    const [initialAnswers] = useState<AnswerState>(() =>
        Object.fromEntries(
            questions.map((question) => [
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
    const [answers, setAnswers] = useState<AnswerState>(initialAnswers);
    const [index, setIndex] = useState(() => {
        const firstOpen = questions.findIndex(
            (question) => !isAnswered(question, initialAnswers),
        );

        return firstOpen === -1 ? questions.length - 1 : firstOpen;
    });

    // Use the server clock so a wrong device clock cannot change the timer.
    const clockOffset = useRef(
        new Date(attempt.server_time).getTime() - Date.now(),
    );
    const computeRemaining = useCallback(
        () =>
            Math.max(
                0,
                Math.ceil(
                    (new Date(attempt.expires_at).getTime() -
                        (Date.now() + clockOffset.current)) /
                        1000,
                ),
            ),
        [attempt.expires_at],
    );
    const [secondsLeft, setSecondsLeft] = useState(computeRemaining);

    const [saveState, setSaveState] = useState<SaveState>('saved');
    const [submitting, setSubmitting] = useState(false);
    const [navigating, setNavigating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const [fullscreenSupported] = useState(
        () => typeof document !== 'undefined' && document.fullscreenEnabled === true,
    );
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fullscreenWarning, setFullscreenWarning] = useState(false);
    const [awaySeconds, setAwaySeconds] = useState<number | null>(null);

    const answersRef = useRef(answers);
    const savedKeyRef = useRef(
        JSON.stringify(makePayload(questions, initialAnswers)),
    );
    const queueRef = useRef<Promise<boolean>>(Promise.resolve(true));
    const submitStarted = useRef(false);
    const wasFullscreen = useRef(false);

    answersRef.current = answers;

    const postEvent = useCallback(
        (event: QuizAttemptEvent) => {
            if (submitStarted.current) {
                return;
            }

            void fetch(QuizAttemptController.recordEvent.url(attempt.id), {
                method: 'POST',
                keepalive: true,
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken(),
                },
                body: JSON.stringify({
                    event,
                    client_time: new Date().toISOString(),
                }),
            }).catch(() => undefined);
        },
        [attempt.id],
    );

    // Saves run one at a time so they cannot overwrite each other out of order.
    const flush = useCallback((): Promise<boolean> => {
        const run = async (): Promise<boolean> => {
            const payload = makePayload(questions, answersRef.current);
            const key = JSON.stringify(payload);

            if (key === savedKeyRef.current) {
                setSaveState('saved');

                return true;
            }

            setSaveState('saving');

            const ok = await new Promise<boolean>((resolve) => {
                let succeeded = false;

                router.patch(
                    QuizAttemptController.saveAnswers.url(attempt.id),
                    { answers: payload },
                    {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => {
                            succeeded = true;
                        },
                        onFinish: () => resolve(succeeded),
                    },
                );
            });

            if (ok) {
                savedKeyRef.current = key;
                setError(null);
                setSaveState(
                    JSON.stringify(
                        makePayload(questions, answersRef.current),
                    ) === key
                        ? 'saved'
                        : 'unsaved',
                );
            } else {
                setSaveState('error');
            }

            return ok;
        };

        queueRef.current = queueRef.current.then(run, run);

        return queueRef.current;
    }, [attempt.id, questions]);

    const submitAttempt = useCallback(() => {
        if (submitStarted.current) {
            return;
        }

        submitStarted.current = true;
        setSubmitting(true);
        setConfirmOpen(false);
        setError(null);

        router.post(
            QuizAttemptController.submit.url(attempt.id),
            { answers: makePayload(questions, answersRef.current) },
            {
                preserveScroll: true,
                onError: () => {
                    submitStarted.current = false;
                    setSubmitting(false);
                    setError(
                        'Submission failed. Your saved answers are still available; try submitting again.',
                    );
                },
            },
        );
    }, [attempt.id, questions]);

    // Timer. The server enforces the deadline; this only submits on time.
    useEffect(() => {
        const tick = () => {
            const remaining = computeRemaining();
            setSecondsLeft(remaining);

            if (remaining === 0) {
                submitAttempt();
            }
        };

        tick();
        const timer = window.setInterval(tick, 1000);

        return () => window.clearInterval(timer);
    }, [computeRemaining, submitAttempt]);

    // Autosave after a short pause in typing or selecting.
    useEffect(() => {
        if (submitStarted.current) {
            return;
        }

        const key = JSON.stringify(makePayload(questions, answers));

        if (key === savedKeyRef.current) {
            return;
        }

        setSaveState('unsaved');
        const timeout = window.setTimeout(() => void flush(), 700);

        return () => window.clearTimeout(timeout);
    }, [answers, flush, questions]);

    // Warn before leaving the tab with changes that are not saved yet.
    useEffect(() => {
        if (saveState === 'saved' || submitting) {
            return;
        }

        const handler = (event: BeforeUnloadEvent) => {
            event.preventDefault();
        };
        window.addEventListener('beforeunload', handler);

        return () => window.removeEventListener('beforeunload', handler);
    }, [saveState, submitting]);

    // Page visibility: the page became inactive. That is a signal, not proof of anything.
    useEffect(() => {
        let hiddenAt: number | null = null;

        const onVisibility = () => {
            if (document.visibilityState === 'hidden') {
                hiddenAt = Date.now();
                postEvent('page_hidden');

                return;
            }

            postEvent('page_visible');

            if (hiddenAt !== null) {
                setAwaySeconds(Math.round((Date.now() - hiddenAt) / 1000));
                hiddenAt = null;
            }
        };

        document.addEventListener('visibilitychange', onVisibility);

        return () =>
            document.removeEventListener('visibilitychange', onVisibility);
    }, [postEvent]);

    useEffect(() => {
        const onBlur = () => postEvent('window_blur');
        const onFocus = () => postEvent('window_focus');

        window.addEventListener('blur', onBlur);
        window.addEventListener('focus', onFocus);

        return () => {
            window.removeEventListener('blur', onBlur);
            window.removeEventListener('focus', onFocus);
        };
    }, [postEvent]);

    useEffect(() => {
        if (!fullscreenSupported) {
            postEvent('fullscreen_unsupported');
        }
    }, [fullscreenSupported, postEvent]);

    useEffect(() => {
        const onChange = () => {
            const active = document.fullscreenElement !== null;
            setIsFullscreen(active);

            if (active) {
                wasFullscreen.current = true;
                setFullscreenWarning(false);
                postEvent('fullscreen_entered');
            } else if (wasFullscreen.current) {
                wasFullscreen.current = false;
                setFullscreenWarning(true);
                postEvent('fullscreen_exited');
            }
        };

        document.addEventListener('fullscreenchange', onChange);

        return () =>
            document.removeEventListener('fullscreenchange', onChange);
    }, [postEvent]);

    const enterFullscreen = () => {
        document.documentElement
            .requestFullscreen()
            .catch(() =>
                setError('Your browser did not allow fullscreen.'),
            );
    };

    const question = questions[index];
    const answered = isAnswered(question, answers);
    const isLast = index === questions.length - 1;
    const gated = fullscreenSupported && !isFullscreen && !submitting;
    const locked = secondsLeft === 0 || submitting || gated;
    const answeredCount = questions.filter((q) =>
        isAnswered(q, answers),
    ).length;
    const unansweredCount = questions.length - answeredCount;
    const firstUnanswered = questions.findIndex((q) => !isAnswered(q, answers));
    const maxReachable =
        firstUnanswered === -1 ? questions.length - 1 : firstUnanswered;

    const goTo = async (target: number) => {
        if (navigating || locked || target === index) {
            return;
        }

        setNavigating(true);
        const ok = await flush();
        setNavigating(false);

        if (ok) {
            setError(null);
            setIndex(target);
        } else {
            setError(
                'Your latest changes could not be saved, so you stayed on this question. Retry, then continue.',
            );
        }
    };

    const retry = async () => {
        const ok = await flush();

        if (ok) {
            setError(null);
        }
    };

    return (
        <>
            <Head title={quiz.title} />
            <div className="flex min-h-svh flex-col bg-background">
                <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                            <h1 className="truncate text-sm font-semibold sm:text-base">
                                {quiz.title}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Question {index + 1} of {questions.length}
                            </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                            <div
                                role="timer"
                                aria-label="Time left"
                                className={cn(
                                    'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-base font-semibold tabular-nums sm:text-lg',
                                    secondsLeft <= 300 &&
                                        'border-destructive/50 text-destructive',
                                )}
                            >
                                <Clock3 className="size-4" aria-hidden="true" />
                                {formatTime(secondsLeft)}
                            </div>
                            <SaveStatus state={saveState} onRetry={retry} />
                        </div>
                    </div>
                    <div
                        className="h-1 bg-muted"
                        role="progressbar"
                        aria-label="Answered questions"
                        aria-valuemin={0}
                        aria-valuemax={questions.length}
                        aria-valuenow={answeredCount}
                    >
                        <div
                            className="h-full bg-sky-600 transition-[width] duration-300 motion-reduce:transition-none"
                            style={{
                                width: `${(answeredCount / questions.length) * 100}%`,
                            }}
                        />
                    </div>
                </header>

                <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-4 sm:py-6">
                    {gated && (
                        <section
                            role="alert"
                            className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center shadow-xs"
                        >
                            <span className="flex size-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
                                <Expand className="size-6" aria-hidden="true" />
                            </span>
                            <div className="space-y-1">
                                <h2 className="text-lg font-semibold">
                                    {fullscreenWarning
                                        ? 'You left fullscreen'
                                        : 'Fullscreen is required'}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {fullscreenWarning
                                        ? 'This was recorded in your attempt log. '
                                        : ''}
                                    Enter fullscreen to see and answer the questions. Your timer
                                    keeps running.
                                </p>
                            </div>
                            <Button
                                type="button"
                                className="rounded-xl"
                                onClick={enterFullscreen}
                            >
                                <Expand aria-hidden="true" />
                                {fullscreenWarning ? 'Return to fullscreen' : 'Enter fullscreen'}
                            </Button>
                        </section>
                    )}

                    {!fullscreenSupported && (
                        <p className="text-xs text-muted-foreground">
                            Fullscreen is not available in this browser, which
                            is common on phones. You can still take the quiz
                            normally.
                        </p>
                    )}

                    {awaySeconds !== null && (
                        <div
                            role="status"
                            className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm text-muted-foreground"
                        >
                            <span>
                                This page was inactive for {awaySeconds}{' '}
                                {awaySeconds === 1 ? 'second' : 'seconds'}. The
                                timer kept running, and the event was recorded.
                            </span>
                            <button
                                type="button"
                                onClick={() => setAwaySeconds(null)}
                                className="shrink-0 text-xs font-medium underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {error && (
                        <div
                            role="alert"
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                        >
                            <span>{error}</span>
                            {saveState === 'error' && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={retry}
                                >
                                    <RefreshCw aria-hidden="true" />
                                    Retry save
                                </Button>
                            )}
                        </div>
                    )}

                    <nav
                        aria-label="Question progress"
                        className="flex flex-wrap gap-1.5"
                    >
                        {questions.map((item, itemIndex) => {
                            const reachable = itemIndex <= maxReachable;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    disabled={!reachable || locked}
                                    onClick={() => void goTo(itemIndex)}
                                    aria-label={`Question ${itemIndex + 1}${isAnswered(item, answers) ? ', answered' : ''}`}
                                    aria-current={
                                        itemIndex === index ? 'step' : undefined
                                    }
                                    className={cn(
                                        'flex size-8 items-center justify-center rounded-lg border text-xs font-medium tabular-nums disabled:cursor-not-allowed disabled:opacity-40',
                                        itemIndex === index &&
                                            'border-sky-600 bg-sky-600 text-white',
                                        itemIndex !== index &&
                                            isAnswered(item, answers) &&
                                            'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                                    )}
                                >
                                    {itemIndex + 1}
                                </button>
                            );
                        })}
                    </nav>

                    <section
                        key={question.id}
                        className="space-y-5 rounded-2xl border bg-card p-5 shadow-xs sm:p-6"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <h2 className="text-base leading-relaxed font-medium whitespace-pre-wrap sm:text-lg">
                                {question.prompt}
                            </h2>
                            <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
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
                                    (option, optionIndex) => {
                                        const selected =
                                            answers[question.id]
                                                ?.selected_option ===
                                            optionIndex;

                                        return (
                                            <label
                                                key={optionIndex}
                                                className={cn(
                                                    'flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm hover:bg-muted/50',
                                                    selected &&
                                                        'border-sky-600 bg-sky-500/10',
                                                    locked &&
                                                        'cursor-not-allowed opacity-70',
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${question.id}`}
                                                    value={optionIndex}
                                                    checked={selected}
                                                    disabled={locked}
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
                                        );
                                    },
                                )}
                            </fieldset>
                        ) : (
                            <textarea
                                value={answers[question.id]?.answer_text ?? ''}
                                onChange={(event) =>
                                    setAnswers((current) => ({
                                        ...current,
                                        [question.id]: {
                                            answer_text: event.target.value,
                                        },
                                    }))
                                }
                                disabled={locked}
                                maxLength={50000}
                                rows={8}
                                aria-label={`Response to question ${index + 1}`}
                                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        )}

                        {!answered && !isLast && (
                            <p className="text-xs text-muted-foreground">
                                Answer this question to continue.
                            </p>
                        )}
                    </section>
                </main>

                <footer className="sticky bottom-0 z-10 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-4 py-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                            disabled={index === 0 || navigating || locked}
                            onClick={() => void goTo(index - 1)}
                        >
                            <ArrowLeft aria-hidden="true" />
                            <span className="hidden sm:inline">Previous</span>
                            <span className="sm:hidden">Prev</span>
                        </Button>

                        {!isLast && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="rounded-xl"
                                disabled={locked}
                                onClick={() => setConfirmOpen(true)}
                            >
                                Submit quiz
                            </Button>
                        )}

                        {isLast ? (
                            <Button
                                type="button"
                                className="rounded-xl"
                                disabled={locked}
                                onClick={() => setConfirmOpen(true)}
                            >
                                {submitting ? 'Submitting…' : 'Submit quiz'}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                className="rounded-xl"
                                disabled={!answered || navigating || locked}
                                onClick={() => void goTo(index + 1)}
                            >
                                {navigating ? 'Saving…' : 'Next'}
                                <ArrowRight aria-hidden="true" />
                            </Button>
                        )}
                    </div>
                </footer>
            </div>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit your quiz?</DialogTitle>
                        <DialogDescription>
                            {unansweredCount > 0
                                ? `You have ${unansweredCount} unanswered ${unansweredCount === 1 ? 'question' : 'questions'}. `
                                : 'All questions are answered. '}
                            Submission is final.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="ghost">
                                Keep working
                            </Button>
                        </DialogClose>
                        <Button type="button" onClick={submitAttempt}>
                            Submit quiz
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}