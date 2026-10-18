import { Form, Head, Link } from '@inertiajs/react';
import BatchController from '@/actions/App/Http/Controllers/Batches/BatchController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AvailableTrainee, BatchMember } from '@/types/batches';

type Props = {
    batch: { id: number; name: string; starts_on: string | null };
    members: BatchMember[];
    available: AvailableTrainee[];
    can: { update: boolean; delete: boolean; assign: boolean };
};

const selectClass =
    'border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function BatchesShow({ batch, members, available, can }: Props) {
    return (
        <>
            <Head title={batch.name} />

            <div className="max-w-3xl space-y-10 p-4">
                <Heading title={batch.name} description={`${members.length} active trainee(s)`} />

                <section className="space-y-4">
                    <h2 className="text-base font-medium">Details</h2>
                    <Form
                        {...BatchController.update.form(batch.id)}
                        options={{ preserveScroll: true }}
                        className="max-w-xl space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Batch name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={batch.name}
                                        required
                                        maxLength={100}
                                        disabled={!can.update}
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="starts_on">Start date</Label>
                                    <Input
                                        id="starts_on"
                                        name="starts_on"
                                        type="date"
                                        defaultValue={batch.starts_on ?? ''}
                                        disabled={!can.update}
                                    />
                                    <InputError message={errors.starts_on} />
                                </div>
                                <div className="flex items-center gap-3">
                                    {can.update && (
                                        <Button type="submit" disabled={processing}>
                                            Save changes
                                        </Button>
                                    )}
                                    <Button asChild variant="ghost">
                                        <Link href={BatchController.index()}>Back to batches</Link>
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </section>

                <section className="space-y-4">
                    <h2 className="text-base font-medium">Trainees</h2>

                    {can.assign && (
                        <Form
                            {...BatchController.assign.form(batch.id)}
                            options={{ preserveScroll: true }}
                            resetOnSuccess
                            className="flex flex-wrap items-end gap-3"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid min-w-64 gap-2">
                                        <Label htmlFor="user_id">Add trainee</Label>
                                        <select id="user_id" name="user_id" required defaultValue="" className={selectClass}>
                                            <option value="" disabled>
                                                Select a trainee
                                            </option>
                                            {available.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name} ({t.username})
                                                    {t.current_batch ? ` - currently in ${t.current_batch}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.user_id} />
                                    </div>
                                    <Button type="submit" variant="secondary" disabled={processing}>
                                        Assign
                                    </Button>
                                </>
                            )}
                        </Form>
                    )}
                    {can.assign && (
                        <p className="text-muted-foreground text-sm">
                            Choosing a trainee who is already in another batch moves them to this one.
                        </p>
                    )}

                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Username</th>
                                    <th className="px-4 py-3 font-medium">Assigned</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {members.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-muted-foreground px-4 py-8 text-center">
                                            No trainees in this batch yet.
                                        </td>
                                    </tr>
                                )}
                                {members.map((m) => (
                                    <tr key={m.id} className="border-t">
                                        <td className="px-4 py-3 font-medium">{m.name}</td>
                                        <td className="px-4 py-3 font-mono">{m.username}</td>
                                        <td className="text-muted-foreground px-4 py-3">
                                            {m.assigned_at ? new Date(m.assigned_at).toLocaleDateString() : ''}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {can.assign && (
                                                <Form
                                                    {...BatchController.unassign.form({ batch: batch.id, assignment: m.id })}
                                                    options={{ preserveScroll: true }}
                                                    onBefore={() => window.confirm(`Remove ${m.name} from this batch?`)}
                                                >
                                                    {({ processing }) => (
                                                        <Button type="submit" variant="outline" size="sm" disabled={processing}>
                                                            Remove
                                                        </Button>
                                                    )}
                                                </Form>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {can.delete && (
                    <section className="space-y-4">
                        <h2 className="text-base font-medium">Delete batch</h2>
                        <p className="text-muted-foreground text-sm">
                            Only possible when the batch has no active trainees. Past assignment history is kept.
                        </p>
                        <Form
                            {...BatchController.destroy.form(batch.id)}
                            onBefore={() => window.confirm(`Delete batch "${batch.name}"?`)}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <Button type="submit" variant="destructive" disabled={processing}>
                                        Delete batch
                                    </Button>
                                    <InputError message={(errors as Record<string, string>).batch} />
                                </>
                            )}
                        </Form>
                    </section>
                )}
            </div>
        </>
    );
}

BatchesShow.layout = {
    breadcrumbs: [
        { title: 'Batches', href: BatchController.index() },
        { title: 'Batch', href: BatchController.index() },
    ],
};