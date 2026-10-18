import { Form, Head, Link } from '@inertiajs/react';
import GradeController from '@/actions/App/Http/Controllers/Grades/GradeController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { GradeEntryRow, GradeRevisionRow } from '@/types/grades';

type Props = {
    trainee: { id: number; name: string; username: string };
    rows: GradeEntryRow[];
    revisions: GradeRevisionRow[];
    can: { manage: boolean; viewAll: boolean };
};

function fmt(value: string | null) {
    return value == null ? '-' : String(Number(value));
}

export default function GradesShow({ trainee, rows, revisions, can }: Props) {
    return (
        <>
            <Head title={`Grades: ${trainee.name}`} />

            <div className="max-w-4xl space-y-10 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading title={trainee.name} description={`Username: ${trainee.username}`} />
                    {can.viewAll && (
                        <Button asChild variant="ghost">
                            <Link href={GradeController.index()}>Back to grades</Link>
                        </Button>
                    )}
                </div>

                <section className="space-y-4">
                    <h2 className="text-base font-medium">Scores</h2>

                    <div className="space-y-3">
                        {rows.map((row) => (
                            <div key={row.component_id} className="space-y-3 rounded-lg border p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <div className="font-medium">
                                            {row.label}
                                            {row.is_final && <span className="text-muted-foreground"> (final)</span>}
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            Max {Number(row.max_score)}, pass {Number(row.pass_score)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-semibold">{fmt(row.score)}</span>
                                        {row.passed === true && <Badge>Passed</Badge>}
                                        {row.passed === false && <Badge variant="destructive">Below pass mark</Badge>}
                                        {row.passed === null && <Badge variant="secondary">Not graded</Badge>}
                                    </div>
                                </div>

                                {row.graded_by && (
                                    <p className="text-muted-foreground text-xs">
                                        Last graded by {row.graded_by}
                                        {row.graded_at ? ` on ${new Date(row.graded_at).toLocaleString()}` : ''}
                                    </p>
                                )}

                                {can.manage && (
                                    <Form
                                        {...GradeController.update.form({ trainee: trainee.id, component: row.component_id })}
                                        options={{ preserveScroll: true }}
                                        className="flex flex-wrap items-start gap-3"
                                    >
                                        {({ processing, errors }) => (
                                            <>
                                                <div className="grid gap-1">
                                                    <Input
                                                        name="score"
                                                        type="number"
                                                        step="0.01"
                                                        min={0}
                                                        max={Number(row.max_score)}
                                                        defaultValue={row.score != null ? Number(row.score) : ''}
                                                        required
                                                        className="w-28"
                                                        aria-label={`${row.label} score`}
                                                    />
                                                    <InputError message={errors.score} />
                                                </div>
                                                <div className="grid min-w-56 flex-1 gap-1">
                                                    <Input
                                                        name="reason"
                                                        maxLength={500}
                                                        placeholder={row.score != null ? 'Reason for change (required)' : 'Note (optional)'}
                                                        autoComplete="off"
                                                        aria-label={`${row.label} reason`}
                                                    />
                                                    <InputError message={errors.reason} />
                                                </div>
                                                <Button type="submit" variant="secondary" disabled={processing}>
                                                    Save
                                                </Button>
                                            </>
                                        )}
                                    </Form>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-base font-medium">History</h2>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="px-4 py-3 font-medium">When</th>
                                    <th className="px-4 py-3 font-medium">Component</th>
                                    <th className="px-4 py-3 font-medium">Change</th>
                                    <th className="px-4 py-3 font-medium">By</th>
                                    <th className="px-4 py-3 font-medium">Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revisions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-muted-foreground px-4 py-8 text-center">
                                            No grade changes yet.
                                        </td>
                                    </tr>
                                )}
                                {revisions.map((r) => (
                                    <tr key={r.id} className="border-t">
                                        <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                                            {r.changed_at ? new Date(r.changed_at).toLocaleString() : ''}
                                        </td>
                                        <td className="px-4 py-3">{r.component}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {fmt(r.old_score)} to {fmt(r.new_score)}
                                        </td>
                                        <td className="px-4 py-3">{r.changed_by}</td>
                                        <td className="text-muted-foreground px-4 py-3">{r.reason ?? ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </>
    );
}

GradesShow.layout = {
    breadcrumbs: [
        { title: 'Grades', href: GradeController.index() },
        { title: 'Trainee grades', href: GradeController.index() },
    ],
};