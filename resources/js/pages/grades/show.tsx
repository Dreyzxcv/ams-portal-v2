import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CircleDashed,
    Clock,
    TrendingDown,
    TrendingUp,
    X,
} from 'lucide-react';
import GradeController from '@/actions/App/Http/Controllers/Grades/GradeController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
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

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('');
}

const pill =
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium';

type State = 'pass' | 'fail' | 'none';

const stateStyles: Record<
    State,
    {
        accent: string;
        text: string;
        bar: string;
        badge: string;
        label: string;
        Icon: typeof Check;
    }
> = {
    pass: {
        accent: 'bg-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400',
        bar: 'bg-emerald-500',
        badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        label: 'Passed',
        Icon: Check,
    },
    fail: {
        accent: 'bg-rose-500',
        text: 'text-rose-600 dark:text-rose-400',
        bar: 'bg-rose-500',
        badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
        label: 'Failed',
        Icon: X,
    },
    none: {
        accent: 'bg-muted-foreground/30',
        text: 'text-muted-foreground',
        bar: 'bg-muted-foreground/40',
        badge: 'bg-muted text-muted-foreground',
        label: 'Not graded',
        Icon: CircleDashed,
    },
};

function stateOf(row: GradeEntryRow): State {
    return row.score == null ? 'none' : row.passed === false ? 'fail' : 'pass';
}

/* Overall ring with a centered percentage */
function Ring({
    percent,
    className,
}: {
    percent: number | null;
    className?: string;
}) {
    const r = 52;
    const c = 2 * Math.PI * r;
    const value = percent == null ? 0 : Math.min(100, Math.max(0, percent));

    return (
        <div
            className={cn('relative size-36 shrink-0', className)}
            role="img"
            aria-label={
                percent == null
                    ? 'No overall score yet'
                    : `Overall score ${percent}%`
            }
        >
            <svg viewBox="0 0 120 120" className="size-full -rotate-90">
                <circle
                    cx="60"
                    cy="60"
                    r={r}
                    fill="none"
                    strokeWidth="10"
                    className="stroke-muted"
                />
                <circle
                    cx="60"
                    cy="60"
                    r={r}
                    fill="none"
                    strokeWidth="10"
                    strokeLinecap="round"
                    stroke="currentColor"
                    strokeDasharray={c}
                    strokeDashoffset={c - (c * value) / 100}
                    className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl leading-none font-bold tabular-nums">
                    {percent != null ? percent : '—'}
                </span>
                {percent != null && (
                    <span className="text-muted-foreground mt-1 text-xs">
                        percent
                    </span>
                )}
            </div>
        </div>
    );
}

/* Score card: big number, progress bar with a tick at the passing mark */
function GradeCard({ row }: { row: GradeEntryRow }) {
    const max = Number(row.max_score);
    const pass = Number(row.pass_score);
    const has = row.score != null;
    const score = has ? Number(row.score) : 0;
    const state = stateOf(row);
    const s = stateStyles[state];
    const percent = max > 0 ? Math.min(100, (score / max) * 100) : 0;
    const passPercent = max > 0 ? Math.min(100, (pass / max) * 100) : 0;

    return (
        <div className="bg-card relative flex flex-col gap-4 overflow-hidden rounded-xl border p-5 pl-6">
            <span
                aria-hidden
                className={cn('absolute inset-y-0 left-0 w-1', s.accent)}
            />

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                        {row.label}
                    </div>
                    {row.is_final && (
                        <span className="text-xs font-medium text-sky-600 dark:text-sky-400">
                            Final component
                        </span>
                    )}
                </div>
                <span className={cn(pill, s.badge)}>
                    <s.Icon className="size-3" aria-hidden />
                    {s.label}
                </span>
            </div>

            <div className="flex items-baseline gap-1.5">
                <span
                    className={cn(
                        'text-4xl leading-none font-bold tabular-nums',
                        s.text,
                    )}
                >
                    {has ? fmt(row.score) : '—'}
                </span>
                <span className="text-muted-foreground text-sm tabular-nums">
                    / {max}
                </span>
            </div>

            <div>
                <div
                    className="bg-muted relative h-2 rounded-full"
                    role="progressbar"
                    aria-label={`${row.label} score`}
                    aria-valuemin={0}
                    aria-valuemax={max}
                    aria-valuenow={score}
                >
                    <div
                        className={cn(
                            'h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none',
                            s.bar,
                        )}
                        style={{ width: `${percent}%` }}
                    />
                    <span
                        aria-hidden
                        className="bg-foreground/70 absolute -top-1 h-4 w-0.5 rounded-full"
                        style={{ left: `calc(${passPercent}% - 1px)` }}
                    />
                </div>
                <div className="text-muted-foreground mt-2 text-xs">
                    Passing score: {pass} / {max}
                </div>
            </div>
        </div>
    );
}

/* One compact row per component: score, reason, save */
function EditRow({
    row,
    traineeId,
}: {
    row: GradeEntryRow;
    traineeId: number;
}) {
    const max = Number(row.max_score);
    const has = row.score != null;

    return (
        <Form
            {...GradeController.update.form({
                trainee: traineeId,
                component: row.component_id,
            })}
            options={{ preserveScroll: true }}
            className="grid items-start gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_120px_minmax(0,1.5fr)_auto]"
        >
            {({ processing, errors, isDirty, recentlySuccessful }) => (
                <>
                    <div className="md:pt-2">
                        <label
                            htmlFor={`score-${row.component_id}`}
                            className="text-sm font-medium"
                        >
                            {row.label}
                        </label>
                        <div className="text-muted-foreground text-xs">
                            Pass at {Number(row.pass_score)} of {max}
                        </div>
                    </div>

                    <div>
                        <Input
                            id={`score-${row.component_id}`}
                            name="score"
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min={0}
                            max={max}
                            defaultValue={has ? Number(row.score) : ''}
                            placeholder={`0 – ${max}`}
                            aria-label={`${row.label} score`}
                            className="tabular-nums"
                            required
                        />
                        <InputError message={errors.score} className="mt-1" />
                    </div>

                    <div>
                        <Input
                            name="reason"
                            maxLength={500}
                            placeholder={
                                has
                                    ? 'Reason for change (required)'
                                    : 'Note (optional)'
                            }
                            autoComplete="off"
                            aria-label={`${row.label} reason`}
                        />
                        <InputError message={errors.reason} className="mt-1" />
                    </div>

                    <div className="flex items-center gap-2 md:pt-0.5">
                        <Button
                            type="submit"
                            size="sm"
                            disabled={processing || !isDirty}
                        >
                            {processing ? 'Saving…' : 'Save'}
                        </Button>
                        <span
                            aria-live="polite"
                            className="min-w-12 text-xs text-emerald-600 dark:text-emerald-400"
                        >
                            {recentlySuccessful ? 'Saved' : ''}
                        </span>
                    </div>
                </>
            )}
        </Form>
    );
}

function Delta({ from, to }: { from: string | null; to: string | null }) {
    if (from == null || to == null) {
        return (
            <span className="font-medium tabular-nums">
                {fmt(from)} → {fmt(to)}
            </span>
        );
    }
    const diff = Number(to) - Number(from);
    const up = diff > 0;
    const flat = diff === 0;
    const Icon = up ? TrendingUp : TrendingDown;

    return (
        <span className="inline-flex items-center gap-2 tabular-nums">
            <span className="text-muted-foreground line-through decoration-1">
                {fmt(from)}
            </span>
            <span className="font-semibold">{fmt(to)}</span>
            {!flat && (
                <span
                    className={cn(
                        'inline-flex items-center gap-0.5 text-xs font-medium',
                        up
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400',
                    )}
                >
                    <Icon className="size-3" aria-hidden />
                    {up ? '+' : ''}
                    {Math.round(diff * 100) / 100}
                </span>
            )}
        </span>
    );
}

export default function GradesShow({ trainee, rows, revisions, can }: Props) {
    const scored = rows.filter(
        (r) => r.score != null && Number(r.max_score) > 0,
    );
    const sumScore = scored.reduce((a, r) => a + Number(r.score), 0);
    const sumMax = scored.reduce((a, r) => a + Number(r.max_score), 0);
    const average =
        sumMax > 0 ? Math.round((sumScore / sumMax) * 10000) / 100 : null;
    const anyFailed = rows.some((r) => r.passed === false);
    const allPassed = rows.length > 0 && rows.every((r) => r.passed === true);
    const passedCount = rows.filter((r) => r.passed === true).length;
    const failedCount = rows.filter((r) => r.passed === false).length;
    const pendingCount = rows.length - passedCount - failedCount;

    const status = anyFailed ? 'FAIL' : allPassed ? 'PASS' : 'PENDING';
    const overall =
        status === 'FAIL'
            ? {
                  text: stateStyles.fail.text,
                  badge: stateStyles.fail.badge,
                  label: 'Failing',
                  Icon: X,
              }
            : status === 'PASS'
              ? {
                    text: stateStyles.pass.text,
                    badge: stateStyles.pass.badge,
                    label: 'Passing',
                    Icon: Check,
                }
              : {
                    text: 'text-amber-600 dark:text-amber-400',
                    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
                    label: 'In progress',
                    Icon: Clock,
                };

    const latest = rows
        .filter((r) => r.graded_by && r.graded_at)
        .sort(
            (a, b) =>
                new Date(b.graded_at as string).getTime() -
                new Date(a.graded_at as string).getTime(),
        )[0];

    return (
        <>
            <Head title={`Grades: ${trainee.name}`} />

            <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            aria-hidden
                            className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                        >
                            {initials(trainee.name)}
                        </div>
                        <div>
                            <h1 className="text-2xl leading-tight font-bold tracking-tight">
                                {trainee.name}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                @{trainee.username}, academic grades across all
                                training phases
                            </p>
                        </div>
                    </div>
                    {can.viewAll && (
                        <Button asChild variant="ghost" size="sm">
                            <Link href={GradeController.index()}>
                                <ArrowLeft className="size-4" aria-hidden />
                                Back to grades
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Overall summary */}
                <section
                    aria-label="Overall performance"
                    className="bg-card flex flex-wrap items-center gap-6 rounded-2xl border p-6 md:gap-10"
                >
                    <Ring percent={average} className={overall.text} />

                    <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-semibold">
                                Overall performance
                            </h2>
                            <span className={cn(pill, overall.badge)}>
                                <overall.Icon className="size-3" aria-hidden />
                                {overall.label}
                            </span>
                        </div>

                        <dl className="grid grid-cols-3 gap-4 sm:max-w-md">
                            <div>
                                <dt className="text-muted-foreground text-xs">
                                    Passed
                                </dt>
                                <dd className="text-2xl font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
                                    {passedCount}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground text-xs">
                                    Failed
                                </dt>
                                <dd
                                    className={cn(
                                        'text-2xl font-semibold tabular-nums',
                                        failedCount > 0
                                            ? 'text-rose-600 dark:text-rose-400'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {failedCount}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground text-xs">
                                    Not graded
                                </dt>
                                <dd className="text-muted-foreground text-2xl font-semibold tabular-nums">
                                    {pendingCount}
                                </dd>
                            </div>
                        </dl>

                        {latest && (
                            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                <Clock className="size-3.5" aria-hidden />
                                Last updated by {latest.graded_by}
                                {latest.graded_at &&
                                    ` on ${new Date(
                                        latest.graded_at,
                                    ).toLocaleDateString()}`}
                            </p>
                        )}
                    </div>
                </section>

                {/* Component cards */}
                <section className="space-y-3">
                    <h2 className="text-base font-semibold">Components</h2>
                    {rows.length === 0 ? (
                        <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-12 text-center text-sm">
                            <CircleDashed className="size-6" aria-hidden />
                            <p className="text-foreground font-medium">
                                No grades yet
                            </p>
                            <p>Scores will appear here once they are recorded.</p>
                        </div>
                    ) : (
                        <div
                            className="grid gap-4"
                            style={{
                                gridTemplateColumns:
                                    'repeat(auto-fill, minmax(260px, 1fr))',
                            }}
                        >
                            {rows.map((row) => (
                                <GradeCard key={row.component_id} row={row} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Edit */}
                {can.manage && rows.length > 0 && (
                    <section className="bg-card overflow-hidden rounded-xl border">
                        <header className="border-b px-5 py-4">
                            <h2 className="text-base font-semibold">
                                Edit grades
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                Changing an existing score needs a reason. Every
                                change is kept in the history below.
                            </p>
                        </header>
                        <div className="divide-y">
                            {rows.map((row) => (
                                <EditRow
                                    key={row.component_id}
                                    row={row}
                                    traineeId={trainee.id}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* History */}
                <section className="space-y-3">
                    <h2 className="text-base font-semibold">History</h2>

                    {revisions.length === 0 ? (
                        <div className="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-center text-sm">
                            No grade changes yet.
                        </div>
                    ) : (
                        <ol className="bg-card divide-y rounded-xl border">
                            {revisions.map((r) => (
                                <li
                                    key={r.id}
                                    className="hover:bg-muted/40 grid gap-x-6 gap-y-1 px-5 py-3.5 text-sm md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1.2fr)]"
                                >
                                    <time
                                        className="text-muted-foreground text-xs md:pt-0.5"
                                        dateTime={r.changed_at ?? undefined}
                                    >
                                        {r.changed_at
                                            ? new Date(
                                                  r.changed_at,
                                              ).toLocaleString()
                                            : ''}
                                    </time>
                                    <div className="space-y-0.5">
                                        <div className="font-medium">
                                            {r.component}
                                        </div>
                                        <Delta
                                            from={r.old_score}
                                            to={r.new_score}
                                        />
                                    </div>
                                    <div className="text-muted-foreground text-xs md:text-sm">
                                        <span className="text-foreground/80">
                                            {r.changed_by}
                                        </span>
                                        {r.reason && <span>: {r.reason}</span>}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
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