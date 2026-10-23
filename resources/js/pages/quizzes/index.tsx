import { Head, Link, router } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { ClipboardList, Plus } from 'lucide-react';
import QuizController from '@/actions/App/Http/Controllers/Quizzes/QuizController';
import { Button } from '@/components/ui/button';
import type { QuizListRow } from '@/types/quizzes';

type Props = {
    quizzes: QuizListRow[];
    can: { create: boolean };
};

export default function QuizzesIndex({ quizzes, can }: Props) {
    useEcho(
        'staff',
        '.quizzes.changed',
        () => router.reload({ only: ['quizzes', 'can'] }),
        [],
    );

    return (
        <>
            <Head title="Quizzes" />
            <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Quizzes
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Phase 1 and Final Examination assessments
                        </p>
                    </div>
                    {can.create && (
                        <Button asChild className="rounded-xl">
                            <Link href={QuizController.create()}>
                                <Plus aria-hidden="true" />
                                New quiz
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
                    {quizzes.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 px-5 py-14 text-center text-muted-foreground">
                            <ClipboardList
                                className="size-8"
                                aria-hidden="true"
                            />
                            <p>No quizzes have been created.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/60 text-left text-xs text-muted-foreground">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">
                                            Quiz
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Phase
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Questions
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Attempts
                                        </th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {quizzes.map((quiz) => (
                                        <tr
                                            key={quiz.id}
                                            className="border-t hover:bg-muted/40"
                                        >
                                            <td className="px-5 py-3 font-medium">
                                                {quiz.title}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {quiz.phase}
                                            </td>
                                            <td className="px-4 py-3 tabular-nums">
                                                {quiz.question_count}
                                            </td>
                                            <td className="px-4 py-3 tabular-nums">
                                                {quiz.attempt_count}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-xl"
                                                >
                                                    <Link
                                                        href={QuizController.show(
                                                            quiz.id,
                                                        )}
                                                    >
                                                        Manage
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
