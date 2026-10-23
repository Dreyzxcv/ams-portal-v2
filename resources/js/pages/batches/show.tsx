import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Layers, Trash2, UserPlus, Users } from 'lucide-react';
import BatchController from '@/actions/App/Http/Controllers/Batches/BatchController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LiveBatchData } from '@/components/live-grades';
import type { AvailableTrainee, BatchMember } from '@/types/batches';

type Props = {
    batch: { id: number; name: string; starts_on: string | null; ends_on: string | null };
    members: BatchMember[];
    available: AvailableTrainee[];
    can: { update: boolean; delete: boolean; assign: boolean };
};

const card = 'bg-card rounded-2xl border shadow-xs';

const selectClass =
    'border-input bg-background h-9 w-full rounded-xl border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

function initials(name: string | null | undefined) {
    return (name ?? '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('');
}

export default function BatchesShow({ batch, members, available, can }: Props) {
    return (
        <>
            <Head title={batch.name} />
            <LiveBatchData only={['batch', 'members']} />

            <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div className="flex min-w-0 items-center gap-4">
                        <span
                            aria-hidden="true"
                            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-600 dark:text-violet-400"
                        >
                            <Layers className="size-6" />
                        </span>
                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                                {batch.name}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                {members.length} active{' '}
                                {members.length === 1 ? 'trainee' : 'trainees'}
                            </p>
                        </div>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="bg-background/70 rounded-xl"
                    >
                        <Link href={BatchController.index()}>
                            <ArrowLeft className="size-4" aria-hidden="true" />
                            Back to batches
                        </Link>
                    </Button>
                </div>

                <div className="grid items-start gap-4 lg:grid-cols-3">
                    <section className={card}>
                        <header className="px-5 pt-4 pb-3">
                            <h2 className="text-sm font-semibold">Details</h2>
                        </header>
                        <Form
                            {...BatchController.update.form(batch.id)}
                            options={{ preserveScroll: true }}
                            className="space-y-5 px-5 pb-5"
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
                                            className="rounded-xl"
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
                                            className="rounded-xl"
                                        />
                                        <InputError message={errors.starts_on} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="ends_on">End date</Label>
                                        <Input
                                            id="ends_on"
                                            name="ends_on"
                                            type="date"
                                            defaultValue={batch.ends_on ?? ''}
                                            disabled={!can.update}
                                            className="rounded-xl"
                                        />
                                        <InputError message={errors.ends_on} />
                                    </div>
                                    {can.update && (
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-xl"
                                        >
                                            Save changes
                                        </Button>
                                    )}
                                </>
                            )}
                        </Form>
                    </section>

                    <section className={`${card} overflow-hidden lg:col-span-2`}>
                        <header className="flex items-center gap-2 px-5 pt-4 pb-3">
                            <Users aria-hidden="true" className="text-muted-foreground size-4" />
                            <h2 className="text-sm font-semibold">Trainees</h2>
                        </header>

                        {can.assign && (
                            <div className="bg-muted/40 border-y px-5 py-4">
                                <Form
                                    {...BatchController.assign.form(batch.id)}
                                    options={{ preserveScroll: true }}
                                    resetOnSuccess
                                    className="flex flex-wrap items-end gap-3"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid min-w-64 flex-1 gap-2">
                                                <Label htmlFor="user_id">Add trainee</Label>
                                                <select
                                                    id="user_id"
                                                    name="user_id"
                                                    required
                                                    defaultValue=""
                                                    className={selectClass}
                                                >
                                                    <option value="" disabled>
                                                        Select a trainee
                                                    </option>
                                                    {available.map((t) => (
                                                        <option key={t.id} value={t.id}>
                                                            {t.name} ({t.username})
                                                            {t.current_batch
                                                                ? ` - currently in ${t.current_batch}`
                                                                : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError message={errors.user_id} />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="rounded-xl"
                                            >
                                                <UserPlus />
                                                Assign
                                            </Button>
                                        </>
                                    )}
                                </Form>
                                <p className="text-muted-foreground mt-2 text-xs">
                                    Choosing a trainee who is already in another batch moves
                                    them to this one.
                                </p>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/60 text-muted-foreground text-left text-xs">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Trainee</th>
                                        <th className="px-4 py-3 font-medium">Assigned</th>
                                        <th className="px-5 py-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="text-muted-foreground px-5 py-12 text-center"
                                            >
                                                No trainees in this batch yet.
                                            </td>
                                        </tr>
                                    )}
                                    {members.map((m) => (
                                        <tr
                                            key={m.id}
                                            className="hover:bg-muted/40 border-t transition-colors"
                                        >
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        aria-hidden="true"
                                                        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-xs font-semibold text-sky-700 dark:text-sky-300"
                                                    >
                                                        {initials(m.name)}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium">
                                                            {m.name}
                                                        </div>
                                                        <div className="text-muted-foreground text-xs">
                                                            @{m.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3">
                                                {m.assigned_at
                                                    ? new Date(m.assigned_at).toLocaleDateString()
                                                    : ''}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {can.assign && (
                                                    <Form
                                                        {...BatchController.unassign.form({
                                                            batch: batch.id,
                                                            assignment: m.id,
                                                        })}
                                                        options={{ preserveScroll: true }}
                                                        onBefore={() =>
                                                            window.confirm(
                                                                `Remove ${m.name} from this batch?`,
                                                            )
                                                        }
                                                    >
                                                        {({ processing }) => (
                                                            <Button
                                                                type="submit"
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={processing}
                                                                className="rounded-xl"
                                                            >
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
                </div>

                {can.delete && (
                    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-5">
                        <div className="flex items-start gap-3">
                            <span
                                aria-hidden="true"
                                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            >
                                <Trash2 className="size-4" />
                            </span>
                            <div>
                                <h2 className="text-sm font-semibold">Delete batch</h2>
                                <p className="text-muted-foreground text-sm">
                                    Only possible when the batch has no active trainees. Past
                                    assignment history is kept.
                                </p>
                            </div>
                        </div>
                        <Form
                            {...BatchController.destroy.form(batch.id)}
                            onBefore={() => window.confirm(`Delete batch "${batch.name}"?`)}
                        >
                            {({ processing, errors }) => (
                                <div className="flex flex-col items-end gap-1">
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={processing}
                                        className="rounded-xl"
                                    >
                                        Delete batch
                                    </Button>
                                    <InputError
                                        message={(errors as Record<string, string>).batch}
                                    />
                                </div>
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