import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CircleDashed,
    Clock,
    Minus,
    Plus,
    TrendingDown,
    TrendingUp,
    X,
} from 'lucide-react';
import GradeController from '@/actions/App/Http/Controllers/Grades/GradeController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LiveGrades } from '@/components/live-grades';
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

const card = 'bg-card rounded-2xl border shadow-xs';

const pill =
    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium';

type State = 'pass' | 'fail' | 'none';

const stateStyles: Record<
    State,
    {
        text: string;
        stroke: string;
        bar: string;
        badge: string;
        label: string;
        Icon: typeof Check;
    }
> = {
    pass: {
        text: 'text-emerald-600 dark:text-emerald-400',
        stroke: 'stroke-emerald-500',
        bar: 'bg-emerald-500',
        badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        label: 'Passed',
        Icon: Check,
    },
    fail: {
        text: 'text-rose-600 dark:text-rose-400',
        stroke: 'stroke-rose-500',
        bar: 'bg-rose-500',
        badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
        label: 'Failed',
        Icon: X,
    },
    none: {
        text: 'text-muted-foreground',
        stroke: 'stroke-muted-foreground/40',
        bar: 'bg-muted-foreground/40',
        badge: 'bg-muted text-muted-foreground',
        label: 'Not graded',
        Icon: CircleDashed,
    },
};

function stateOf(row: GradeEntryRow): State {
    return row.score == null ? 'none' : row.passed === false ? 'fail' : 'pass';
}

/* Small score ring with "score/max" in the middle */
function ScoreRing({
    percent,
    stroke,
    textClass,
    children,
}: {
    percent: number;
    stroke: string;
    textClass: string;
    children: React.ReactNode;
}) {
    const size = 84;
    const w = 7;
    const r = (size - w) / 2;
    const c = 2 * Math.PI * r;

    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90" aria-hidden>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    strokeWidth={w}
                    className="stroke-foreground/10"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    strokeWidth={w}
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={c - (c * Math.min(100, percent)) / 100}
                    className={cn(
                        stroke,
                        'transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none',
                    )}
                />
            </svg>
            <div
                className={cn(
                    'absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums',
                    textClass,
                )}
            >
                {children}
            </div>
        </div>
    );
}

/* Component card: ring on the left, title, status and progress on the right */
function GradeCard({ row }: { row: GradeEntryRow }) {
    const max = Number(row.max_score);
    const pass = Number(row.pass_score);
    const has = row.score != null;
    const score = has ? Number(row.score) : 0;
    const s = stateStyles[stateOf(row)];
    const percent = max > 0 ? Math.min(100, (score / max) * 100) : 0;
    const passPercent = max > 0 ? Math.min(100, (pass / max) * 100) : 0;

    return (
        <div className={cn(card, 'flex items-center gap-4 p-5')}>
            <ScoreRing percent={percent} stroke={s.stroke} textClass={s.text}>
                {has ? `${fmt(row.score)}/${max}` : '—'}
            </ScoreRing>

            <div className="min-w-0 flex-1 space-y-2.5">
                <div>
                    <div
                        className={cn(
                            'text-sm leading-snug font-semibold',
                            row.is_final && 'text-sky-700 dark:text-sky-300',
                        )}
                    >
                        {row.label}
                    </div>
                    {row.is_final && (
                        <div className="text-muted-foreground text-xs">
                            Final component
                        </div>
                    )}
                </div>

                <span className={cn(pill, s.badge)}>
                    <s.Icon className="size-3" aria-hidden />
                    {s.label}
                </span>

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
                            className="bg-foreground/60 absolute -top-0.5 h-3 w-0.5 rounded-full"
                            style={{ left: `calc(${passPercent}% - 1px)` }}
                        />
                    </div>
                    <div className="text-muted-foreground mt-1.5 text-xs tabular-nums">
                        Passing: {pass}/{max}
                    </div>
                </div>
            </div>
        </div>
    );
}

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
                            className="rounded-xl tabular-nums"
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
                            className="rounded-xl"
                        />
                        <InputError message={errors.reason} className="mt-1" />
                    </div>

                    <div className="flex items-center gap-2 md:pt-0.5">
                        <Button
                            type="submit"
                            size="sm"
                            className="rounded-xl"
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

function formatWhen(iso: string | null) {
    return iso
        ? new Date(iso).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
          })
        : '';
}

/* One plain-language entry: what happened, who did it, when, and why */
function HistoryItem({
    r,
    max,
}: {
    r: GradeRevisionRow;
    max: number | null;
}) {
    const outOf = max ? ` out of ${max}` : '';
    const hadOld = r.old_score != null;
    const hasNew = r.new_score != null;
    const diff = hadOld && hasNew ? Number(r.new_score) - Number(r.old_score) : 0;

    let Icon = TrendingUp;
    let tone = 'bg-sky-500/10 text-sky-700 dark:text-sky-300';
    let text: React.ReactNode;

    if (!hadOld && hasNew) {
        Icon = Plus;
        tone = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
        text = (
            <>
                Score added:{' '}
                <strong className="font-semibold">{fmt(r.new_score)}</strong>
                {outOf}
            </>
        );
    } else if (hadOld && !hasNew) {
        Icon = Minus;
        tone = 'bg-rose-500/10 text-rose-700 dark:text-rose-400';
        text = (
            <>
                Score removed. It was{' '}
                <strong className="font-semibold">{fmt(r.old_score)}</strong>
                {outOf}
            </>
        );
    } else {
        if (diff > 0) {
            tone = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
        } else if (diff < 0) {
            Icon = TrendingDown;
            tone = 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
        }
        text = (
            <>
                Score changed from{' '}
                <strong className="font-semibold">{fmt(r.old_score)}</strong> to{' '}
                <strong className="font-semibold">{fmt(r.new_score)}</strong>
                {outOf}
                {diff !== 0 && (
                    <span
                        className={cn(
                            'ml-2 text-xs font-medium',
                            diff > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400',
                        )}
                    >
                        ({diff > 0 ? '+' : ''}
                        {Math.round(diff * 100) / 100} points)
                    </span>
                )}
            </>
        );
    }

    return (
        <li className="flex gap-4 px-5 py-4">
            <span
                aria-hidden
                className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl',
                    tone,
                )}
            >
                <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
                <div className="text-sm font-semibold">{r.component}</div>
                <p className="text-sm">{text}</p>
                <p className="text-muted-foreground text-xs">
                    By {r.changed_by}
                    {r.changed_at && (
                        <>
                            {' on '}
                            <time dateTime={r.changed_at}>
                                {formatWhen(r.changed_at)}
                            </time>
                        </>
                    )}
                </p>
                {r.reason && (
                    <p className="bg-muted/60 mt-2 rounded-xl px-3 py-2 text-sm">
                        <span className="text-muted-foreground">Reason: </span>
                        {r.reason}
                    </p>
                )}
            </div>
        </li>
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

    const overall = anyFailed
        ? { ...stateStyles.fail, label: 'Fail', Icon: X }
        : allPassed
          ? { ...stateStyles.pass, label: 'Pass', Icon: Check }
          : {
                text: 'text-amber-600 dark:text-amber-400',
                stroke: 'stroke-amber-500',
                bar: 'bg-amber-500',
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
            <LiveGrades only={['rows', 'revisions']} />

            <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div className="flex min-w-0 items-center gap-4">
                        <div
                            aria-hidden
                            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-base font-semibold text-sky-700 dark:text-sky-300"
                        >
                            {initials(trainee.name)}
                        </div>
                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                                {trainee.name}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                @{trainee.username} · Performance across all
                                training phases
                            </p>
                        </div>
                    </div>
                    {can.viewAll && (
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="bg-background/70 rounded-xl"
                        >
                            <Link href={GradeController.index()}>
                                <ArrowLeft className="size-4" aria-hidden />
                                Back to grades
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Component cards */}
                {rows.length === 0 ? (
                    <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-2xl border border-dashed px-4 py-12 text-center text-sm">
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
                                'repeat(auto-fit, minmax(280px, 1fr))',
                        }}
                    >
                        {rows.map((row) => (
                            <GradeCard key={row.component_id} row={row} />
                        ))}
                    </div>
                )}

                {/* Overall performance */}
                <section
                    aria-label="Overall performance"
                    className={cn(
                        card,
                        'flex flex-wrap items-center justify-between gap-6 p-6',
                    )}
                >
                    <div className="min-w-0 flex-1 basis-72 space-y-3">
                        <h2 className="text-muted-foreground text-sm font-medium">
                            Overall performance
                        </h2>
                        <div
                            className={cn(
                                'text-5xl leading-none font-semibold tracking-tight tabular-nums',
                                overall.text,
                            )}
                        >
                            {average != null ? `${average}%` : '—'}
                        </div>
                        <div
                            className="bg-muted h-2.5 max-w-md overflow-hidden rounded-full"
                            role="progressbar"
                            aria-label="Overall score"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={average ?? 0}
                        >
                            <div
                                className={cn('h-full rounded-full', overall.bar)}
                                style={{
                                    width: `${Math.min(100, average ?? 0)}%`,
                                }}
                            />
                        </div>
                        <dl className="flex flex-wrap gap-2 text-xs">
                            <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-400">
                                <dd className="inline font-semibold tabular-nums">
                                    {passedCount}
                                </dd>{' '}
                                <dt className="inline">passed</dt>
                            </div>
                            <div
                                className={cn(
                                    'rounded-full px-3 py-1',
                                    failedCount > 0
                                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                                        : 'bg-muted text-muted-foreground',
                                )}
                            >
                                <dd className="inline font-semibold tabular-nums">
                                    {failedCount}
                                </dd>{' '}
                                <dt className="inline">failed</dt>
                            </div>
                            <div className="bg-muted text-muted-foreground rounded-full px-3 py-1">
                                <dd className="inline font-semibold tabular-nums">
                                    {pendingCount}
                                </dd>{' '}
                                <dt className="inline">not graded</dt>
                            </div>
                        </dl>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-right">
                        <span
                            className={cn(
                                pill,
                                overall.badge,
                                'px-4 py-1.5 text-sm font-semibold',
                            )}
                        >
                            <overall.Icon className="size-4" aria-hidden />
                            {overall.label}
                        </span>
                        {latest && (
                            <p className="text-muted-foreground text-xs">
                                Updated by {latest.graded_by}
                                {latest.graded_at &&
                                    ` on ${new Date(latest.graded_at).toLocaleDateString()}`}
                            </p>
                        )}
                    </div>
                </section>

                {/* Edit */}
                {can.manage && rows.length > 0 && (
                    <section className={cn(card, 'overflow-hidden')}>
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
                <section className={cn(card, 'overflow-hidden')}>
                    <header className="border-b px-5 py-4">
                        <h2 className="text-base font-semibold">
                            Grade history
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Every time a score is added or changed, it is
                            listed here.
                        </p>
                    </header>

                    {revisions.length === 0 ? (
                        <div className="text-muted-foreground px-4 py-10 text-center text-sm">
                            No grade changes yet. Updates will show here once a score is added.
                        </div>
                    ) : (
                        <ol className="divide-y">
                            {revisions.map((r) => {
                                const match = rows.find(
                                    (row) => row.label === r.component,
                                );

                                return (
                                    <HistoryItem
                                        key={r.id}
                                        r={r}
                                        max={
                                            match ? Number(match.max_score) : null
                                        }
                                    />
                                );
                            })}
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