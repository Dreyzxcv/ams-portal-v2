import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ClipboardList,
    Pencil,
    UserPlus,
    Users,
} from 'lucide-react';
import QuizController from '@/actions/App/Http/Controllers/Quizzes/QuizController';
import QuizReviewController from '@/actions/App/Http/Controllers/Quizzes/QuizReviewController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';

type AccessRow = {
    trainee_id: number;
    name: string;
    username: string;
    granted_at: string;
};

type AttemptRow = {
    id: number;
    trainee_id: number;
    name: string;
    username: string;
    started_at: string;
    submitted_at: string | null;
    reviewed_at: string | null;
    status: string;
    auto_score: string | null;
    final_score: string | null;
};

type Props = {
    quiz: {
        id: number;
        title: string;
        phase: string;
        grade_component_key: string;
        duration_minutes: number;
        instructions: string;
        question_count: number;
        total_points: string;
        can_edit: boolean;
    };
    accesses: AccessRow[];
    available_trainees: { id: number; name: string; username: string }[];
    attempts: AttemptRow[];
};

const card = 'bg-card overflow-hidden rounded-2xl border shadow-xs';

export default function QuizzesShow({
    quiz,
    accesses,
    available_trainees,
    attempts,
}: Props) {
    return (
        <>
            <Head title={quiz.title} />
            <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div className="flex min-w-0 items-center gap-4">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
                            <ClipboardList
                                className="size-6"
                                aria-hidden="true"
                            />
                        </span>
                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                                {quiz.title}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {quiz.phase} · {quiz.duration_minutes} minutes ·{' '}
                                {quiz.question_count} questions
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {quiz.can_edit && (
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-xl"
                            >
                                <Link href={QuizController.edit(quiz.id)}>
                                    <Pencil aria-hidden="true" />
                                    Edit quiz
                                </Link>
                            </Button>
                        )}
                        <Button asChild variant="ghost" className="rounded-xl">
                            <Link href={QuizController.index()}>
                                <ArrowLeft aria-hidden="true" />
                                Back to quizzes
                            </Link>
                        </Button>
                    </div>
                </header>

                {!quiz.can_edit && (
                    <p className="rounded-xl border px-4 py-3 text-sm text-muted-foreground">
                        This quiz is locked because an attempt has started.
                    </p>
                )}

                <section className={card}>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                        <div className="flex items-center gap-2">
                            <Users
                                className="size-4 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <h2 className="font-semibold">Trainee access</h2>
                            <span className="text-sm text-muted-foreground">
                                ({accesses.length} assigned)
                            </span>
                        </div>
                    </div>
                    {available_trainees.length > 0 && (
                        <Form
                            {...QuizController.grant.form(quiz.id)}
                            options={{ preserveScroll: true }}
                            resetOnSuccess
                            className="grid gap-3 border-b bg-muted/40 p-5 sm:grid-cols-[1fr_auto]"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <label
                                            htmlFor="trainee_id"
                                            className="text-sm font-medium"
                                        >
                                            Grant access to a trainee
                                        </label>
                                        <select
                                            id="trainee_id"
                                            name="trainee_id"
                                            defaultValue=""
                                            required
                                            className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-xs"
                                        >
                                            <option value="" disabled>
                                                Select a trainee
                                            </option>
                                            {available_trainees.map(
                                                (trainee) => (
                                                    <option
                                                        key={trainee.id}
                                                        value={trainee.id}
                                                    >
                                                        {trainee.name} (@
                                                        {trainee.username})
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        <InputError
                                            message={errors.trainee_id}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="self-end rounded-xl"
                                    >
                                        <UserPlus aria-hidden="true" />
                                        Grant access
                                    </Button>
                                </>
                            )}
                        </Form>
                    )}
                    {accesses.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                            No trainees currently have access.
                        </p>
                    ) : (
                        <ul className="divide-y">
                            {accesses.map((access) => (
                                <li
                                    key={access.trainee_id}
                                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {access.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            @{access.username}
                                        </p>
                                    </div>
                                    <Form
                                        {...QuizController.revoke.form({
                                            quiz: quiz.id,
                                            trainee: access.trainee_id,
                                        })}
                                        options={{ preserveScroll: true }}
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                variant="outline"
                                                size="sm"
                                                disabled={processing}
                                                className="rounded-xl"
                                            >
                                                Revoke
                                            </Button>
                                        )}
                                    </Form>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className={card}>
                    <header className="flex items-center justify-between border-b px-5 py-4">
                        <h2 className="font-semibold">Attempts and review</h2>
                        <span className="text-sm text-muted-foreground">
                            {attempts.length} started
                        </span>
                    </header>
                    {attempts.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                            No trainee has started this quiz.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">
                                            Trainee
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Started
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Automatic score
                                        </th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {attempts.map((attempt) => (
                                        <tr
                                            key={attempt.id}
                                            className="border-t"
                                        >
                                            <td className="px-5 py-3">
                                                <p className="font-medium">
                                                    {attempt.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    @{attempt.username}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(
                                                    attempt.started_at,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 capitalize">
                                                {attempt.status}
                                            </td>
                                            <td className="px-4 py-3 tabular-nums">
                                                {attempt.auto_score == null
                                                    ? '—'
                                                    : `${Number(attempt.auto_score)} / ${Number(quiz.total_points)}`}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {attempt.submitted_at && (
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-xl"
                                                    >
                                                        <Link
                                                            href={QuizReviewController.show(
                                                                {
                                                                    quiz: quiz.id,
                                                                    attempt:
                                                                        attempt.id,
                                                                },
                                                            )}
                                                        >
                                                            {attempt.reviewed_at
                                                                ? 'View review'
                                                                : 'Review'}
                                                        </Link>
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
