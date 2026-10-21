import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarClock, Clock } from 'lucide-react';
import ProgressController from '@/actions/App/Http/Controllers/Progress/ProgressController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    trainee: { id: number; name: string; username: string };
    progress: {
        current_phase: number;
        started_on: string | null;
        exists: boolean;
        updated_at: string | null;
        updated_by: string | null;
    };
    remaining_days: number | null;
    days_configured: boolean;
    max_phase: number;
};

const card = 'bg-card rounded-2xl border shadow-xs';

const selectClass =
    'border-input bg-background h-9 w-full rounded-xl border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('');
}

export default function ProgressEdit({ trainee, progress, remaining_days, days_configured, max_phase }: Props) {
    const phases = Array.from({ length: max_phase }, (_, i) => i + 1);

    return (
        <>
            <Head title={`Progress: ${trainee.name}`} />

            <div className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div className="flex min-w-0 items-center gap-4">
                        <div
                            aria-hidden="true"
                            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-base font-semibold text-sky-700 dark:text-sky-300"
                        >
                            {initials(trainee.name)}
                        </div>
                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                                {trainee.name}
                            </h1>
                            <p className="text-muted-foreground text-sm">@{trainee.username} · Update training progress</p>
                        </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="bg-background/70 rounded-xl">
                        <Link href={ProgressController.index()}>
                            <ArrowLeft className="size-4" aria-hidden="true" />
                            Back to progress
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className={`${card} p-5`}>
                        <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <CalendarClock aria-hidden="true" className="size-5" />
                        </span>
                        <div className="mt-4 text-4xl leading-none font-semibold tracking-tight tabular-nums">
                            {remaining_days ?? '-'}
                        </div>
                        <div className="text-muted-foreground mt-2 text-sm">
                            {remaining_days != null
                                ? 'Estimated days remaining'
                                : days_configured
                                  ? 'Set a start date to estimate days remaining'
                                  : 'Program length not configured'}
                        </div>
                    </div>

                    <div className={`${card} p-5`}>
                        <span className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                            <Clock aria-hidden="true" className="size-5" />
                        </span>
                        <div className="mt-4 text-sm font-medium">
                            {progress.updated_at ? new Date(progress.updated_at).toLocaleString() : 'No progress recorded yet'}
                        </div>
                        <div className="text-muted-foreground mt-2 text-sm">
                            Last update{progress.updated_by ? ` by ${progress.updated_by}` : ''}
                        </div>
                    </div>
                </div>

                <section className={card}>
                    <header className="border-b px-5 py-4">
                        <h2 className="text-sm font-semibold">Progress details</h2>
                    </header>
                    <Form
                        {...ProgressController.update.form(trainee.id)}
                        options={{ preserveScroll: true }}
                        className="space-y-5 p-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="current_phase">Current phase</Label>
                                    <select
                                        id="current_phase"
                                        name="current_phase"
                                        defaultValue={progress.current_phase}
                                        className={selectClass}
                                    >
                                        {phases.map((p) => (
                                            <option key={p} value={p}>
                                                Phase {p}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.current_phase} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="started_on">Start date</Label>
                                    <Input
                                        id="started_on"
                                        name="started_on"
                                        type="date"
                                        defaultValue={progress.started_on ?? ''}
                                        className="rounded-xl"
                                    />
                                    <InputError message={errors.started_on} />
                                </div>

                                <div className="flex items-center gap-3 pt-1">
                                    <Button type="submit" disabled={processing} className="rounded-xl">
                                        Save progress
                                    </Button>
                                    <Button asChild variant="ghost" className="rounded-xl">
                                        <Link href={ProgressController.index()}>Cancel</Link>
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </section>
            </div>
        </>
    );
}

ProgressEdit.layout = {
    breadcrumbs: [
        { title: 'Progress', href: ProgressController.index() },
        { title: 'Update progress', href: ProgressController.index() },
    ],
};