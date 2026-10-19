import { Head, Link, usePage } from '@inertiajs/react';
import {
    Award,
    BadgeCheck,
    BadgeX,
    ChevronRight,
    CircleCheck,
    ClipboardList,
    FileClock,
    Flag,
    GraduationCap,
    Hourglass,
    Layers,
    PenLine,
    Stethoscope,
    TriangleAlert,
    UserCheck,
    UserX,
    Users,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type {
    ActivityItem,
    BatchSummary,
    StatGroup,
    StatItem,
    TraineeSummary,
    Trend,
} from '@/types/dashboard';

type Props = {
    mode: 'staff' | 'trainee';
    groups: StatGroup[];
    activity: ActivityItem[] | null;
    trainee: TraineeSummary | null;
    trend?: Trend | null;
    batches?: BatchSummary[] | null;
};

const eyebrowClass =
    'text-muted-foreground font-mono text-[11px] font-medium tracking-widest uppercase';

const groupIcons: Record<string, LucideIcon> = {
    Users,
    Batches: Layers,
    Grades: GraduationCap,
    Violations: TriangleAlert,
    Progress: Hourglass,
    Certificates: Award,
};

const labelIcons: Record<string, LucideIcon> = {
    'Active users': UserCheck,
    'Active trainees without a batch': UserX,
    'Grades entered, last 7 days': PenLine,
    'Trainees who passed the final exam': BadgeCheck,
    Pending: FileClock,
    Issued: BadgeCheck,
    Revoked: BadgeX,
};

const tones = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    muted: 'bg-muted text-muted-foreground',
};

type Tone = keyof typeof tones;

const toneText: Record<Tone, string> = {
    blue: 'text-blue-600 dark:text-blue-400',
    violet: 'text-violet-600 dark:text-violet-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    sky: 'text-sky-600 dark:text-sky-400',
    teal: 'text-teal-600 dark:text-teal-400',
    rose: 'text-rose-600 dark:text-rose-400',
    muted: 'text-muted-foreground',
};

const toneBar: Record<Tone, string> = {
    blue: 'bg-blue-500',
    violet: 'bg-violet-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    sky: 'bg-sky-500',
    teal: 'bg-teal-500',
    rose: 'bg-rose-500',
    muted: 'bg-muted-foreground/40',
};

const toneTop: Record<Tone, string> = {
    blue: 'border-t-blue-500/50',
    violet: 'border-t-violet-500/50',
    emerald: 'border-t-emerald-500/50',
    amber: 'border-t-amber-500/50',
    sky: 'border-t-sky-500/50',
    teal: 'border-t-teal-500/50',
    rose: 'border-t-rose-500/50',
    muted: 'border-t-border',
};

const groupTones: Record<string, Tone> = {
    Users: 'blue',
    Batches: 'violet',
    Grades: 'emerald',
    Violations: 'amber',
    Progress: 'sky',
    Certificates: 'teal',
};

const labelTones: Record<string, Tone> = {
    Pending: 'amber',
    Revoked: 'rose',
    'Active trainees without a batch': 'amber',
};

const actionLabels: Record<string, string> = {
    Users: 'Manage Users',
    Batches: 'Batches',
    Grades: 'Manage Grades',
    Violations: 'Manage Violations',
    Progress: 'Manage Progress',
};


/* ---------- Shared building blocks ---------- */

function IconChip({
    icon: Icon,
    tone,
    className,
}: {
    icon: LucideIcon;
    tone: Tone;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-md',
                tones[tone],
                className,
            )}
        >
            <Icon aria-hidden="true" className="size-4" />
        </span>
    );
}

function StatusBadge({
    tone,
    children,
}: {
    tone: Tone;
    children: React.ReactNode;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-wider uppercase',
                tones[tone],
            )}
        >
            {children}
        </span>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className={cn(eyebrowClass, 'flex items-center gap-2')}>
            <span aria-hidden="true" className="bg-border h-px w-4" />
            {children}
        </p>
    );
}

type Chip = { label: string; value: number; tone: Tone };

function Welcome({
    eyebrow,
    title,
    subtitle,
    chips = [],
    deco: Deco,
    roomy,
}: {
    eyebrow: string;
    title: string;
    subtitle: string;
    chips?: Chip[];
    deco?: LucideIcon;
    roomy?: boolean;
}) {
    return (
        <div
            className={cn(
                'bg-card relative flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-md border px-5',
                roomy ? 'py-5' : 'py-3',
            )}
        >
            {Deco && (
                <Deco
                    aria-hidden="true"
                    className="text-foreground pointer-events-none absolute top-1/2 right-6 size-16 -translate-y-1/2 opacity-[0.06]"
                />
            )}
            <div className="relative min-w-0">
                <p className="font-mono text-[11px] tracking-widest text-sky-600 uppercase dark:text-sky-400">
                    {eyebrow}
                </p>
                <h1 className="truncate text-xl leading-tight font-semibold">
                    {title}
                </h1>
                <p className="text-muted-foreground mt-0.5 text-xs">
                    {subtitle}
                </p>
            </div>
            {chips.length > 0 && (
                <dl className="relative flex flex-wrap gap-2">
                    {chips.map((c) => (
                        <div
                            key={c.label}
                            className="flex min-w-16 flex-col-reverse rounded-md border px-3 py-1.5 text-center"
                        >
                            <dt className="text-muted-foreground mt-0.5 text-[11px]">
                                {c.label}
                            </dt>
                            <dd
                                className={cn(
                                    'text-lg leading-none font-semibold tabular-nums',
                                    toneText[c.tone],
                                )}
                            >
                                {c.value}
                            </dd>
                        </div>
                    ))}
                </dl>
            )}
        </div>
    );
}

function Panel({
    title,
    icon: Icon,
    aside,
    children,
    className,
    roomy,
}: {
    title: string;
    icon?: LucideIcon;
    aside?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    roomy?: boolean;
}) {
    return (
        <section
            className={cn(
                'bg-card flex min-w-0 flex-col overflow-hidden rounded-md border',
                className,
            )}
        >
            <header
                className={cn(
                    'flex items-center justify-between gap-2 border-b px-4',
                    roomy ? 'px-5 py-3.5' : 'py-2.5',
                )}
            >
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                    {Icon && (
                        <Icon
                            aria-hidden="true"
                            className="text-muted-foreground size-4"
                        />
                    )}
                    {title}
                </h2>
                {aside}
            </header>
            {children}
        </section>
    );
}

function Meter({
    label,
    value,
    total,
    barClass = 'bg-primary',
    thick,
}: {
    label: string;
    value: number;
    total: number;
    barClass?: string;
    thick?: boolean;
}) {
    const percent =
        total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0;

    return (
        <div
            className={cn(
                'bg-muted overflow-hidden rounded-full',
                thick ? 'h-2.5' : 'h-1.5',
            )}
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={value}
        >
            <div
                className={cn('h-full', barClass)}
                style={{ width: `${percent}%` }}
            />
        </div>
    );
}

/* ---------- Trainee ---------- */

function SummaryCard({
    icon,
    tone,
    value,
    label,
    badge,
}: {
    icon: LucideIcon;
    tone: Tone;
    value: React.ReactNode;
    label: string;
    badge: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                'bg-card rounded-md border border-t-2 p-5',
                toneTop[tone],
            )}
        >
            <IconChip
                icon={icon}
                tone={tone}
                className="size-10 [&>svg]:size-5"
            />
            <div
                className={cn(
                    'mt-3 text-3xl leading-none font-semibold tabular-nums',
                    toneText[tone],
                )}
            >
                {value}
            </div>
            <div className="text-muted-foreground mt-1.5 text-sm">{label}</div>
            <div className="mt-3">{badge}</div>
        </div>
    );
}

function BarRow({
    label,
    right,
    value,
    total,
    tone,
}: {
    label: string;
    right: string;
    value: number;
    total: number;
    tone: Tone;
}) {
    return (
        <div>
            <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span
                    className={cn(
                        'font-mono text-xs font-semibold tabular-nums',
                        toneText[tone],
                    )}
                >
                    {right}
                </span>
            </div>
            <Meter
                label={label}
                value={value}
                total={total}
                barClass={toneBar[tone]}
            />
        </div>
    );
}

function TraineeView({ trainee }: { trainee: TraineeSummary }) {
    const entered = Number(trainee.grades_entered);
    const passed = Number(trainee.grades_passed);
    const total = Number(trainee.grades_total);
    const violations = Number(trainee.violations);
    const issued = Boolean(trainee.certificate_number);

    const comps = trainee.components ?? [];
    const hasComps = comps.length > 0;
    const scored = comps.filter((c) => c.score !== null && c.max);
    const sumScore = scored.reduce((a, c) => a + Number(c.score), 0);
    const sumMax = scored.reduce((a, c) => a + Number(c.max), 0);
    const average =
        sumMax > 0 ? Math.round((sumScore / sumMax) * 10000) / 100 : null;
    const anyFailed = comps.some((c) => c.passed === false);
    const allPassed = hasComps && comps.every((c) => c.passed === true);

    const complete = total > 0 && entered >= total;
    const percent =
        total > 0 ? Math.min(100, Math.round((entered / total) * 100)) : 0;

    const firstCard =
        average !== null ? (
            <SummaryCard
                icon={GraduationCap}
                tone="blue"
                value={`${average}%`}
                label="Overall average"
                badge={
                    anyFailed ? (
                        <StatusBadge tone="rose">Fail</StatusBadge>
                    ) : allPassed ? (
                        <StatusBadge tone="emerald">Pass</StatusBadge>
                    ) : (
                        <StatusBadge tone="amber">Pending</StatusBadge>
                    )
                }
            />
        ) : (
            <SummaryCard
                icon={GraduationCap}
                tone="blue"
                value={
                    <>
                        {passed}
                        <span className="text-muted-foreground text-lg font-normal">
                            {' '}
                            of {total}
                        </span>
                    </>
                }
                label="Grades passed"
                badge={
                    total === 0 ? (
                        <StatusBadge tone="muted">No grades yet</StatusBadge>
                    ) : passed === total ? (
                        <StatusBadge tone="emerald">All passed</StatusBadge>
                    ) : entered > passed ? (
                        <StatusBadge tone="amber">
                            {entered - passed} not passed
                        </StatusBadge>
                    ) : (
                        <StatusBadge tone="muted">
                            {Math.max(0, total - entered)} pending
                        </StatusBadge>
                    )
                }
            />
        );

    return (
        <>
            <div className="grid gap-3 sm:grid-cols-3">
                {firstCard}
                <SummaryCard
                    icon={TriangleAlert}
                    tone={violations === 0 ? 'emerald' : 'amber'}
                    value={violations}
                    label="Violations"
                    badge={
                        violations === 0 ? (
                            <StatusBadge tone="emerald">
                                Clean record
                            </StatusBadge>
                        ) : (
                            <StatusBadge tone="amber">
                                {violations} recorded
                            </StatusBadge>
                        )
                    }
                />
                <SummaryCard
                    icon={issued ? CircleCheck : Award}
                    tone={issued ? 'emerald' : 'muted'}
                    value={issued ? '✓' : '—'}
                    label="Certificate"
                    badge={
                        issued ? (
                            <StatusBadge tone="emerald">Issued</StatusBadge>
                        ) : (
                            <StatusBadge tone="muted">Not issued yet</StatusBadge>
                        )
                    }
                />
            </div>

            <div className="grid items-stretch gap-3 lg:grid-cols-2">
                <Panel title="Grades overview" icon={ClipboardList} roomy>
                    <div className="space-y-4 p-5">
                        {total === 0 ? (
                            <p className="text-muted-foreground py-6 text-center text-sm">
                                No graded components yet.
                            </p>
                        ) : hasComps ? (
                            comps.map((c, i) => {
                                const has = c.score !== null;
                                const tone: Tone = !has
                                    ? 'muted'
                                    : c.passed === false
                                    ? 'rose'
                                    : 'emerald';
                                const label = c.name || `Component ${i + 1}`;
                                return (
                                    <BarRow
                                        key={`${i}-${label}`}
                                        label={label}
                                        right={
                                            has
                                                ? `${c.score}${c.max ? `/${c.max}` : ''}`
                                                : 'N/A'
                                        }
                                        value={has ? Number(c.score) : 0}
                                        total={Number(c.max ?? 0)}
                                        tone={tone}
                                    />
                                );
                            })
                        ) : (
                            <>
                                <BarRow
                                    label="Grades entered"
                                    right={`${entered}/${total}`}
                                    value={entered}
                                    total={total}
                                    tone="blue"
                                />
                                <BarRow
                                    label="Grades passed"
                                    right={`${passed}/${total}`}
                                    value={passed}
                                    total={total}
                                    tone="emerald"
                                />
                            </>
                        )}
                    </div>
                </Panel>

                <Panel title="Training progress" icon={Flag} roomy>
                    <div className="flex flex-1 flex-col">
                        <div className="flex-1 p-5">
                            {complete ? (
                                <div className="flex h-full flex-col items-center justify-center py-4 text-center">
                                    <IconChip
                                        icon={GraduationCap}
                                        tone="emerald"
                                        className="size-12 [&>svg]:size-6"
                                    />
                                    <p className="mt-3 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                                        Training completed
                                    </p>
                                    <p className="text-muted-foreground mt-0.5 text-xs">
                                        All graded components are in
                                    </p>
                                    <div className="mt-3">
                                        <StatusBadge tone="emerald">
                                            100% complete
                                        </StatusBadge>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-1.5 flex items-baseline justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Overall completion
                                        </span>
                                        <span className="font-mono text-xs font-semibold text-sky-600 tabular-nums dark:text-sky-400">
                                            {percent}%
                                        </span>
                                    </div>
                                    <Meter
                                        label="Overall completion"
                                        value={entered}
                                        total={total}
                                        barClass="bg-sky-500"
                                        thick
                                    />
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="bg-muted/50 rounded-md p-3 text-center">
                                            <div className="text-2xl font-semibold text-sky-600 tabular-nums dark:text-sky-400">
                                                {trainee.current_phase ?? '—'}
                                            </div>
                                            <div className="text-muted-foreground text-[11px]">
                                                Current phase
                                            </div>
                                        </div>
                                        <div className="bg-muted/50 rounded-md p-3 text-center">
                                            <div className="text-2xl font-semibold text-amber-600 tabular-nums dark:text-amber-400">
                                                {trainee.remaining_days ?? '—'}
                                            </div>
                                            <div className="text-muted-foreground text-[11px]">
                                                Days left
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <dl className="grid grid-cols-2 gap-3 border-t px-5 py-3 text-xs">
                            <div>
                                <dt className="text-muted-foreground">Batch</dt>
                                <dd className="font-medium">
                                    {trainee.batch ?? 'Not assigned'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">
                                    Started on
                                </dt>
                                <dd className="font-medium">
                                    {trainee.started_on ?? 'Not set'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </Panel>
            </div>

            <Panel title="Certificate status" icon={Award} roomy>
                <div className="flex items-center gap-4 p-5">
                    <IconChip
                        icon={issued ? CircleCheck : Award}
                        tone={issued ? 'emerald' : 'muted'}
                        className="size-12 [&>svg]:size-6"
                    />
                    {issued ? (
                        <div className="min-w-0">
                            <p className="text-base font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
                                Certificate issued
                            </p>
                            <p className="text-muted-foreground font-mono text-xs">
                                ID: {trainee.certificate_number}
                            </p>
                            {trainee.certificate_issued_at && (
                                <p className="text-muted-foreground text-xs">
                                    Issued: {trainee.certificate_issued_at}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm font-semibold">
                                Not issued yet
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Your certificate will appear here once it is
                                issued.
                            </p>
                        </div>
                    )}
                </div>
            </Panel>
        </>
    );
}

/* ---------- Staff ---------- */

function KpiCard({
    label,
    value,
    href,
    icon: Icon,
    tone,
    sub,
}: StatItem & { icon: LucideIcon; tone: Tone; sub: string }) {
    const content = (
        <>
            <div className="flex items-start justify-between gap-2">
                <div
                    className={cn(
                        'text-2xl leading-none font-semibold tabular-nums',
                        value === 0
                            ? 'text-muted-foreground/60'
                            : toneText[tone],
                    )}
                >
                    {value}
                </div>
                <IconChip icon={Icon} tone={tone} />
            </div>
            <div className="mt-1.5 text-xs leading-snug">{label}</div>
            <div
                className={cn(
                    'mt-1 font-mono text-[10px] tracking-wide uppercase opacity-70',
                    toneText[tone],
                )}
            >
                {sub}
                {href && ' →'}
            </div>
        </>
    );

    const base = cn(
        'bg-card block rounded-md border border-t-2 px-3 py-2.5',
        toneTop[tone],
    );

    return href ? (
        <Link
            href={href}
            className={cn(
                base,
                'hover:bg-muted/60 focus-visible:ring-ring outline-none focus-visible:ring-2',
            )}
        >
            {content}
        </Link>
    ) : (
        <div className={base}>{content}</div>
    );
}

function QuickActions({
    actions,
    className,
}: {
    actions: { label: string; href: string; icon: LucideIcon }[];
    className?: string;
}) {
    return (
        <Panel title="Quick actions" icon={Zap} className={className}>
            <nav
                aria-label="Quick actions"
                className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-1"
            >
                {actions.map((a, i) => (
                    <Link
                        key={a.href}
                        href={a.href}
                        className={cn(
                            'focus-visible:ring-ring flex items-center gap-2.5 rounded-md border px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2',
                            i === 0
                                ? 'bg-primary text-primary-foreground border-transparent hover:opacity-90'
                                : 'hover:bg-muted/60',
                        )}
                    >
                        <a.icon aria-hidden="true" className="size-4 shrink-0" />
                        <span className="flex-1">{a.label}</span>
                        <ChevronRight
                            aria-hidden="true"
                            className="size-4 shrink-0 opacity-50"
                        />
                    </Link>
                ))}
            </nav>
        </Panel>
    );
}

function BatchOverview({
    batches,
    href,
}: {
    batches: BatchSummary[];
    href?: string | null;
}) {
    const shown = batches.slice(0, 4);
    const extra = batches.length - shown.length;

    return (
        <Panel
            title="Batch overview"
            icon={Layers}
            aside={
                href ? (
                    <Link
                        href={href}
                        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded text-xs outline-none focus-visible:ring-2"
                    >
                        Manage
                    </Link>
                ) : undefined
            }
        >
            {batches.length === 0 ? (
                <p className="text-muted-foreground px-4 py-6 text-center text-xs">
                    No batches yet.
                </p>
            ) : (
                <ul className="divide-y">
                    {shown.map((b) => (
                        <li
                            key={b.id}
                            className="flex items-center justify-between gap-2 px-4 py-2 text-xs"
                        >
                            <span className="flex min-w-0 items-center gap-2">
                                <span
                                    aria-hidden="true"
                                    className="size-2 shrink-0 rounded-sm bg-violet-500"
                                />
                                <span className="truncate font-medium">
                                    {b.name}
                                </span>
                            </span>
                            <span
                                className={cn(
                                    'rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums',
                                    tones.violet,
                                )}
                                aria-label={`${b.members} trainees`}
                            >
                                {b.members}
                            </span>
                        </li>
                    ))}
                    {extra > 0 && (
                        <li className="text-muted-foreground px-4 py-2 font-mono text-[11px]">
                            +{extra} more batches
                        </li>
                    )}
                </ul>
            )}
        </Panel>
    );
}

const seriesStyles: Record<string, { color: string; dot: string }> = {
    'Grades entered': { color: '#10b981', dot: 'bg-emerald-500' },
    Violations: { color: '#f59e0b', dot: 'bg-amber-500' },
};
const fallbackSeries = { color: 'var(--primary)', dot: 'bg-primary' };

function formatWeek(iso: string) {
    return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
}

function TrendPanel({
    trend,
    className,
}: {
    trend: Trend;
    className?: string;
}) {
    const max = Math.max(0, ...trend.series.flatMap((s) => s.values));
    const sum = trend.series.reduce(
        (a, s) => a + s.values.reduce((x, y) => x + y, 0),
        0,
    );
    const n = trend.weeks.length;
    const summary = `Weekly counts, ${formatWeek(trend.weeks[0])} to ${formatWeek(trend.weeks[n - 1])}`;

    const data = trend.weeks.map((week, i) => ({
        week,
        ...Object.fromEntries(trend.series.map((s) => [s.label, s.values[i]])),
    }));

    return (
        <Panel
            title="Weekly trend"
            icon={ClipboardList}
            className={className}
            aside={
                <span className="rounded-full bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-sky-600 uppercase dark:text-sky-400">
                    {sum} in {n} weeks
                </span>
            }
        >
            <div className="px-4 py-3">
                {max === 0 ? (
                    <p className="text-muted-foreground py-6 text-center text-xs">
                        Nothing recorded in the last {n} weeks.
                    </p>
                ) : (
                    <>
                        <div className="text-muted-foreground mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                            {trend.series.map((s) => (
                                <span
                                    key={s.label}
                                    className="flex items-center gap-1.5"
                                >
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            'size-2 rounded-full',
                                            (
                                                seriesStyles[s.label] ??
                                                fallbackSeries
                                            ).dot,
                                        )}
                                    />
                                    {s.label}
                                </span>
                            ))}
                            <span className="ml-auto tabular-nums">
                                Peak: {max}
                            </span>
                        </div>

                        <div role="img" aria-label={summary} className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data}
                                    barGap={2}
                                    margin={{
                                        top: 4,
                                        right: 8,
                                        bottom: 0,
                                        left: -24,
                                    }}
                                >
                                    <CartesianGrid
                                        vertical={false}
                                        stroke="var(--border)"
                                    />
                                    <XAxis
                                        dataKey="week"
                                        tickFormatter={formatWeek}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{
                                            fontSize: 10,
                                            fill: 'var(--muted-foreground)',
                                        }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        domain={[
                                            0,
                                            (dataMax: number) =>
                                                Math.max(dataMax, 3),
                                        ]}
                                        tickCount={4}
                                        tickLine={false}
                                        axisLine={false}
                                        width={40}
                                        tick={{
                                            fontSize: 10,
                                            fill: 'var(--muted-foreground)',
                                        }}
                                    />
                                    <Tooltip
                                        cursor={{
                                            fill: 'var(--muted)',
                                            opacity: 0.5,
                                        }}
                                        labelFormatter={(w) =>
                                            `Week of ${formatWeek(String(w))}`
                                        }
                                        contentStyle={{
                                            fontSize: 12,
                                            borderRadius: 6,
                                            background: 'var(--popover)',
                                            color: 'var(--popover-foreground)',
                                            border: '1px solid var(--border)',
                                        }}
                                    />
                                    {trend.series.map((s) => (
                                        <Bar
                                            key={s.label}
                                            dataKey={s.label}
                                            fill={
                                                (
                                                    seriesStyles[s.label] ??
                                                    fallbackSeries
                                                ).color
                                            }
                                            radius={[2, 2, 0, 0]}
                                            maxBarSize={14}
                                            isAnimationActive={false}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <table className="sr-only">
                            <caption>{summary}</caption>
                            <thead>
                                <tr>
                                    <th>Week of</th>
                                    {trend.series.map((s) => (
                                        <th key={s.label}>{s.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {trend.weeks.map((w, i) => (
                                    <tr key={w}>
                                        <td>{formatWeek(w)}</td>
                                        {trend.series.map((s) => (
                                            <td key={s.label}>{s.values[i]}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </Panel>
    );
}

function ActivityTable({ activity }: { activity: ActivityItem[] }) {
    return (
        <Panel title="Recent activity" icon={ClipboardList}>
            <div className="max-h-64 overflow-auto">
                <table className="w-full text-xs">
                    <thead className="bg-muted sticky top-0 text-left">
                        <tr>
                            <th className="px-3 py-2 font-medium">When</th>
                            <th className="px-3 py-2 font-medium">Who</th>
                            <th className="px-3 py-2 font-medium">Action</th>
                            <th className="px-3 py-2 font-medium">Subject</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activity.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-muted-foreground px-3 py-6 text-center"
                                >
                                    No activity yet.
                                </td>
                            </tr>
                        )}
                        {activity.map((item) => (
                            <tr
                                key={item.id}
                                className="hover:bg-muted/40 border-t"
                            >
                                <td className="text-muted-foreground px-3 py-1.5 whitespace-nowrap tabular-nums">
                                    {item.occurred_at
                                        ? new Date(
                                              item.occurred_at,
                                          ).toLocaleString()
                                        : ''}
                                </td>
                                <td className="px-3 py-1.5 font-mono whitespace-nowrap">
                                    {item.actor}
                                </td>
                                <td className="px-3 py-1.5 font-mono whitespace-nowrap">
                                    {item.action}
                                </td>
                                <td className="text-muted-foreground px-3 py-1.5">
                                    {item.subject ?? ''}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Panel>
    );
}

/* ---------- Page ---------- */

export default function Dashboard({
    mode,
    groups,
    activity,
    trainee,
    trend,
    batches,
}: Props) {
    const { auth } = usePage<{ auth?: { user?: { name?: string } } }>().props;
    const name = auth?.user?.name ?? (mode === 'trainee' ? 'Trainee' : 'Staff');

    const stat = (group: string, label: string) =>
        groups
            .find((g) => g.title === group)
            ?.stats.find((s) => s.label === label)?.value;

    const chips: Chip[] = (
        [
            ['Total', stat('Users', 'Total users'), 'blue'],
            ['Active', stat('Users', 'Active users'), 'emerald'],
            ['Violations', stat('Violations', 'Last 30 days'), 'amber'],
            ['Batches', stat('Batches', 'Batches'), 'violet'],
        ] as const
    ).flatMap(([label, value, tone]) =>
        value === undefined ? [] : [{ label, value, tone }],
    );

    // Quick actions come from the links the role already has (first link per group).
    const actions = groups.flatMap((g) => {
        const href = g.stats.find((s) => s.href)?.href;
        return href && actionLabels[g.title]
            ? [
                  {
                      label: actionLabels[g.title],
                      href: href.split('?')[0],
                      icon: groupIcons[g.title] ?? Layers,
                  },
              ]
            : [];
    });

    const batchesHref = groups
        .find((g) => g.title === 'Batches')
        ?.stats.find((s) => s.href)?.href;
    const side = actions.length > 0 || batches != null;

    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-3 p-4">
                {mode === 'trainee' ? (
                    <>
                        <Welcome
                            roomy
                            deco={Stethoscope}
                            eyebrow="Welcome back"
                            title={name}
                            subtitle={
                                trainee
                                    ? `${trainee.batch ?? 'No batch assigned'} · Your progress at a glance`
                                    : 'Your progress at a glance'
                            }
                        />
                        {trainee && <TraineeView trainee={trainee} />}
                    </>
                ) : (
                    <>
                        <Welcome
                            eyebrow="Command overview"
                            title={name}
                            subtitle="Figures shown are limited to what your role can access"
                            chips={chips}
                        />

                        {groups.length === 0 && (
                            <p className="text-muted-foreground text-sm">
                                Your role has no dashboard figures.
                            </p>
                        )}

                        {groups.length > 0 && (
                            <>
                                <SectionLabel>Overview</SectionLabel>
                                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
                                    {groups.flatMap((group) =>
                                        group.stats.map((s) => (
                                            <KpiCard
                                                key={`${group.title}-${s.label}`}
                                                {...s}
                                                sub={group.title}
                                                icon={
                                                    labelIcons[s.label] ??
                                                    groupIcons[group.title] ??
                                                    Layers
                                                }
                                                tone={
                                                    labelTones[s.label] ??
                                                    groupTones[group.title] ??
                                                    'blue'
                                                }
                                            />
                                        )),
                                    )}
                                </div>
                            </>
                        )}

                        {(trend || side) && (
                            <div className="grid items-start gap-3 lg:grid-cols-3">
                                {trend && (
                                    <TrendPanel
                                        trend={trend}
                                        className={side ? 'lg:col-span-2' : 'lg:col-span-3'}
                                    />
                                )}
                                {side && (
                                    <div className={cn('space-y-3', !trend && 'lg:col-span-3')}>
                                        {batches != null && (
                                            <BatchOverview batches={batches} href={batchesHref} />
                                        )}
                                        {actions.length > 0 && <QuickActions actions={actions} />}
                                    </div>
                                )}
                            </div>
                        )}

                        {activity && <ActivityTable activity={activity} />}
                    </>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};