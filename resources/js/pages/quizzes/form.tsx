import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import QuizController from '@/actions/App/Http/Controllers/Quizzes/QuizController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { QuizInput, QuizQuestionInput } from '@/types/quizzes';

type QuizRecord = QuizInput & {
    id: number;
};

type Props = {
    quiz: QuizRecord | null;
    components: { key: string; label: string }[];
};

const selectClass =
    'border-input bg-background h-9 w-full rounded-xl border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

function emptyQuestion(): QuizQuestionInput {
    return {
        type: 'multiple_choice',
        prompt: '',
        points: '1',
        options: ['', ''],
        correct_option: 0,
    };
}

export default function QuizForm({ quiz, components }: Props) {
    const form = useForm<QuizInput>(
        quiz ?? {
            grade_component_key: components[0]?.key ?? 'phase_1',
            title: '',
            instructions: '',
            duration_minutes: '30',
            questions: [emptyQuestion()],
        },
    );
    const errorFor = (key: string): string | undefined =>
        Object.entries(form.errors).find(([errorKey]) => errorKey === key)?.[1];

    function updateQuestion(
        index: number,
        updates: Partial<QuizQuestionInput>,
    ) {
        form.setData(
            'questions',
            form.data.questions.map((question, questionIndex) =>
                questionIndex === index
                    ? { ...question, ...updates }
                    : question,
            ),
        );
    }

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (quiz) {
            form.put(QuizController.update.url(quiz.id));
        } else {
            form.post(QuizController.store.url());
        }
    }

    return (
        <>
            <Head title={quiz ? 'Edit quiz' : 'Create quiz'} />
            <div className="mx-auto w-full max-w-4xl space-y-4 p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3 rounded-3xl border bg-sky-500/10 p-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            {quiz ? 'Edit quiz' : 'Create quiz'}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Quizzes are available only for Phase 1 and the Final
                            Examination.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link
                            href={
                                quiz
                                    ? QuizController.show(quiz.id)
                                    : QuizController.index()
                            }
                        >
                            <ArrowLeft aria-hidden="true" />
                            Cancel
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <section className="grid gap-5 rounded-2xl border bg-card p-5 shadow-xs sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="grade_component_key">
                                Quiz phase
                            </Label>
                            <select
                                id="grade_component_key"
                                value={form.data.grade_component_key}
                                onChange={(event) =>
                                    form.setData(
                                        'grade_component_key',
                                        event.target.value,
                                    )
                                }
                                className={selectClass}
                                required
                            >
                                {components.map((component) => (
                                    <option
                                        key={component.key}
                                        value={component.key}
                                    >
                                        {component.label}
                                    </option>
                                ))}
                            </select>
                            <InputError
                                message={form.errors.grade_component_key}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="duration_minutes">
                                Time limit (minutes)
                            </Label>
                            <Input
                                id="duration_minutes"
                                type="number"
                                min={1}
                                max={65535}
                                value={form.data.duration_minutes}
                                onChange={(event) =>
                                    form.setData(
                                        'duration_minutes',
                                        event.target.value,
                                    )
                                }
                                className="rounded-xl"
                                required
                            />
                            <InputError
                                message={form.errors.duration_minutes}
                            />
                        </div>
                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="title">Quiz title</Label>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(event) =>
                                    form.setData('title', event.target.value)
                                }
                                maxLength={150}
                                className="rounded-xl"
                                required
                            />
                            <InputError message={form.errors.title} />
                        </div>
                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="instructions">Instructions</Label>
                            <textarea
                                id="instructions"
                                value={form.data.instructions}
                                onChange={(event) =>
                                    form.setData(
                                        'instructions',
                                        event.target.value,
                                    )
                                }
                                maxLength={10000}
                                rows={4}
                                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                required
                            />
                            <InputError message={form.errors.instructions} />
                        </div>
                    </section>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold">Questions</h2>
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() =>
                                form.setData('questions', [
                                    ...form.data.questions,
                                    emptyQuestion(),
                                ])
                            }
                        >
                            <Plus aria-hidden="true" />
                            Add question
                        </Button>
                    </div>
                    <InputError message={form.errors.questions} />

                    {form.data.questions.map((question, index) => {
                        const options = question.options ?? [];
                        const correctOption = question.correct_option ?? 0;

                        return (
                            <section
                                key={index}
                                className="space-y-4 rounded-2xl border bg-card p-5 shadow-xs"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="font-semibold">
                                        Question {index + 1}
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Remove question ${index + 1}`}
                                        disabled={
                                            form.data.questions.length === 1
                                        }
                                        onClick={() =>
                                            form.setData(
                                                'questions',
                                                form.data.questions.filter(
                                                    (_, questionIndex) =>
                                                        questionIndex !== index,
                                                ),
                                            )
                                        }
                                    >
                                        <Trash2
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </Button>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor={`question-${index}-type`}
                                        >
                                            Question type
                                        </Label>
                                        <select
                                            id={`question-${index}-type`}
                                            value={question.type}
                                            onChange={(event) => {
                                                const type = event.target
                                                    .value as QuizQuestionInput['type'];
                                                updateQuestion(index, {
                                                    type,
                                                    options:
                                                        type ===
                                                        'multiple_choice'
                                                            ? ['', '']
                                                            : null,
                                                    correct_option:
                                                        type ===
                                                        'multiple_choice'
                                                            ? 0
                                                            : null,
                                                });
                                            }}
                                            className={selectClass}
                                        >
                                            <option value="multiple_choice">
                                                Multiple choice
                                            </option>
                                            <option value="paragraph">
                                                Paragraph / free text
                                            </option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor={`question-${index}-points`}
                                        >
                                            Points
                                        </Label>
                                        <Input
                                            id={`question-${index}-points`}
                                            type="number"
                                            min={0.01}
                                            step="0.01"
                                            max={99999.99}
                                            value={question.points}
                                            onChange={(event) =>
                                                updateQuestion(index, {
                                                    points: event.target.value,
                                                })
                                            }
                                            className="rounded-xl"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor={`question-${index}-prompt`}>
                                        Prompt
                                    </Label>
                                    <textarea
                                        id={`question-${index}-prompt`}
                                        value={question.prompt}
                                        onChange={(event) =>
                                            updateQuestion(index, {
                                                prompt: event.target.value,
                                            })
                                        }
                                        maxLength={10000}
                                        rows={3}
                                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        required
                                    />
                                    <InputError
                                        message={
                                            form.errors[
                                                `questions.${index}.prompt`
                                            ]
                                        }
                                    />
                                </div>
                                {question.type === 'multiple_choice' && (
                                    <fieldset className="space-y-3">
                                        <legend className="text-sm font-medium">
                                            Answer options · select the correct
                                            answer
                                        </legend>
                                        {options.map((option, optionIndex) => (
                                            <div
                                                key={optionIndex}
                                                className="flex items-start gap-3"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`correct-${index}`}
                                                    aria-label={`Mark option ${optionIndex + 1} as correct`}
                                                    checked={
                                                        correctOption ===
                                                        optionIndex
                                                    }
                                                    onChange={() =>
                                                        updateQuestion(index, {
                                                            correct_option:
                                                                optionIndex,
                                                        })
                                                    }
                                                    className="mt-2 size-4 accent-sky-600"
                                                />
                                                <div className="min-w-0 flex-1 space-y-1">
                                                    <Input
                                                        value={option}
                                                        onChange={(event) =>
                                                            updateQuestion(
                                                                index,
                                                                {
                                                                    options:
                                                                        options.map(
                                                                            (
                                                                                value,
                                                                                itemIndex,
                                                                            ) =>
                                                                                itemIndex ===
                                                                                optionIndex
                                                                                    ? event
                                                                                          .target
                                                                                          .value
                                                                                    : value,
                                                                        ),
                                                                },
                                                            )
                                                        }
                                                        maxLength={1000}
                                                        aria-label={`Question ${index + 1} option ${optionIndex + 1}`}
                                                        placeholder={`Option ${optionIndex + 1}`}
                                                        className="rounded-xl"
                                                        required
                                                    />
                                                    <InputError
                                                        message={errorFor(
                                                            `questions.${index}.options.${optionIndex}`,
                                                        )}
                                                    />
                                                </div>
                                                {options.length > 2 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Remove option ${optionIndex + 1}`}
                                                        onClick={() =>
                                                            updateQuestion(
                                                                index,
                                                                {
                                                                    options:
                                                                        options.filter(
                                                                            (
                                                                                _,
                                                                                itemIndex,
                                                                            ) =>
                                                                                itemIndex !==
                                                                                optionIndex,
                                                                        ),
                                                                    correct_option:
                                                                        correctOption ===
                                                                        optionIndex
                                                                            ? 0
                                                                            : correctOption >
                                                                                optionIndex
                                                                              ? correctOption -
                                                                                1
                                                                              : correctOption,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <Trash2
                                                            className="size-4"
                                                            aria-hidden="true"
                                                        />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        {options.length < 8 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl"
                                                onClick={() =>
                                                    updateQuestion(index, {
                                                        options: [
                                                            ...options,
                                                            '',
                                                        ],
                                                    })
                                                }
                                            >
                                                <Plus aria-hidden="true" />
                                                Add option
                                            </Button>
                                        )}
                                        <InputError
                                            message={errorFor(
                                                `questions.${index}.options`,
                                            )}
                                        />
                                        <InputError
                                            message={errorFor(
                                                `questions.${index}.correct_option`,
                                            )}
                                        />
                                    </fieldset>
                                )}
                            </section>
                        );
                    })}

                    <InputError message={errorFor('quiz')} />
                    <div className="flex flex-wrap gap-3">
                        <Button
                            type="submit"
                            className="rounded-xl"
                            disabled={
                                form.processing || components.length === 0
                            }
                        >
                            {form.processing
                                ? 'Saving…'
                                : quiz
                                  ? 'Save quiz'
                                  : 'Create quiz'}
                        </Button>
                        {components.length === 0 && (
                            <p className="self-center text-sm text-muted-foreground">
                                A quiz already exists for each eligible phase.
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
}
