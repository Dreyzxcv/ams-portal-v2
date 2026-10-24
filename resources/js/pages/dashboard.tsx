import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    Award,
    ChevronRight,
    CircleCheck,
    ClipboardList,
    Flag,
    GraduationCap,
    Hourglass,
    Layers,
    Stethoscope,
    TriangleAlert,
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
import { LiveGrades } from '@/components/live-grades';
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
import CertificateController from '@/actions/App/Http/Controllers/Certificates/CertificateController';
import FilePreview from '@/components/file-preview';
import { Button } from '@/components/ui/button';
import { LiveBatchAssignment } from '@/components/live-batch-assignment';

type Props = {
    mode: 'staff' | 'trainee';
    groups: StatGroup[];
    activity: ActivityItem[] | null;
    trainee: TraineeSummary | null;
    trend?: Trend | null;
    batches?: BatchSummary[] | null;
};

/* ---------- Tokens ---------- */

const groupIcons: Record<string, LucideIcon> = {
    Users,
    Batches: Layers,
    Grades: GraduationCap,
    Violations: TriangleAlert,
    Progress: Hourglass,
    Certificates: Award,
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

const toneStroke: Record<Tone, string> = {
    blue: 'stroke-blue-500',
    violet: 'stroke-violet-500',
    emerald: 'stroke-emerald-500',
    amber: 'stroke-amber-500',
    sky: 'stroke-sky-500',
    teal: 'stroke-teal-500',
    rose: 'stroke-rose-500',
    muted: 'stroke-muted-foreground/40',
};

const actionLabels: Record<string, string> = {
    Users: 'Manage users',
    Batches: 'Batches',
    Grades: 'Manage grades',
    Violations: 'Manage violations',
    Progress: 'Manage progress',
};

const card = 'bg-card rounded-2xl border shadow-xs';
const focusRing =
    'focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

function greeting() {
    const h = new Date().getHours();

    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

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
                'flex size-9 shrink-0 items-center justify-center rounded-xl',
                tones[tone],
                className,
            )}
        >
            <Icon aria-hidden="true" className="size-[18px]" />
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
                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                tones[tone],
            )}
        >
            {children}
        </span>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-foreground/90 px-1 pt-2 text-base font-semibold tracking-tight">
            {children}
        </h2>
    );
}

function Ring({
    value,
    tone,
    size = 112,
    stroke = 10,
    children,
}: {
    value: number;
    tone: Tone;
    size?: number;
    stroke?: number;
    children?: React.ReactNode;
}) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = Math.min(100, Math.max(0, value));

    return (
        <div
            className="relative shrink-0"
            style={{ width: size, height: size }}
            role="img"
            aria-label={`${Math.round(pct)}%`}
        >
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    strokeWidth={stroke}
                    className="stroke-foreground/10"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={c - (pct / 100) * c}
                    className={toneStroke[tone]}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    );
}

type Chip = { label: string; value: number; tone: Tone };

function Hero({
    title,
    subtitle,
    chips = [],
    deco: Deco,
    aside,
}: {
    title: string;
    subtitle: string;
    chips?: Chip[];
    deco?: LucideIcon;
    aside?: React.ReactNode;
}) {
    return (
        <div className="relative overflow-hidden rounded-3xl border bg-sky-500/10 p-6 sm:p-8">
            {Deco && (
                <Deco
                    aria-hidden="true"
                    className="text-foreground pointer-events-none absolute right-8 bottom-4 size-32 opacity-[0.05]"
                />
            )}
            <div className="relative flex flex-wrap items-center justify-between gap-6">
                <div className="min-w-0">
                    <p className="text-muted-foreground text-sm">
                        {greeting()}
                    </p>
                    <h1 className="mt-1 truncate text-3xl font-semibold tracking-tight sm:text-4xl">
                        {title}
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-prose text-sm">
                        {subtitle}
                    </p>
                    {chips.length > 0 && (
                        <dl className="mt-5 flex flex-wrap gap-2">
                            {chips.map((c) => (
                                <div
                                    key={c.label}
                                    className="bg-background/70 flex items-baseline gap-2 rounded-full border px-3.5 py-1.5 backdrop-blur"
                                >
                                    <dd
                                        className={cn(
                                            'text-base font-semibold tabular-nums',
                                            toneText[c.tone],
                                        )}
                                    >
                                        {c.value}
                                    </dd>
                                    <dt className="text-muted-foreground text-xs">
                                        {c.label}
                                    </dt>
                                </div>
                            ))}
                        </dl>
                    )}
                </div>
                {aside && <div className="relative">{aside}</div>}
            </div>
        </div>
    );
}

function Panel({
    title,
    icon: Icon,
    aside,
    children,
    className,
}: {
    title: string;
    icon?: LucideIcon;
    aside?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(card, 'flex min-w-0 flex-col overflow-hidden', className)}
        >
            <header className="flex items-center justify-between gap-2 px-5 pt-4 pb-3">
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
                thick ? 'h-3' : 'h-2',
            )}
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={value}
        >
            <div
                className={cn('h-full rounded-full', barClass)}
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
        <div className={cn(card, 'p-5')}>
            <div className="flex items-start justify-between">
                <IconChip icon={icon} tone={tone} className="size-11" />
                {badge}
            </div>
            <div
                className={cn(
                    'mt-5 text-4xl leading-none font-semibold tracking-tight tabular-nums',
                    toneText[tone],
                )}
            >
                {value}
            </div>
            <div className="text-muted-foreground mt-2 text-sm">{label}</div>
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
            <div className="mb-2 flex items-baseline justify-between text-sm">
                <span>{label}</span>
                <span
                    className={cn('text-sm font-semibold tabular-nums', toneText[tone])}
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
            <div className="grid gap-4 sm:grid-cols-3">
                {firstCard}
                <SummaryCard
                    icon={TriangleAlert}
                    tone={violations === 0 ? 'emerald' : 'amber'}
                    value={violations}
                    label="Violations"
                    badge={
                        violations === 0 ? (
                            <StatusBadge tone="emerald">Clean record</StatusBadge>
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
                    value={issued ? 'Issued' : 'Not yet'}
                    label="Certificate"
                    badge={
                        issued ? (
                            <StatusBadge tone="emerald">Complete</StatusBadge>
                        ) : (
                            <StatusBadge tone="muted">Waiting</StatusBadge>
                        )
                    }
                />
            </div>

            <div className="grid items-stretch gap-4 lg:grid-cols-2">
                <Panel title="Grades overview" icon={ClipboardList}>
                    <div className="space-y-5 px-5 pt-1 pb-5">
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

                <Panel title="Training progress" icon={Flag}>
                    <div className="flex flex-1 flex-col">
                        <div className="flex flex-1 items-center justify-center px-5 py-3">
                            {complete ? (
                                <div className="flex flex-col items-center text-center">
                                    <Ring value={100} tone="emerald" size={120}>
                                        <GraduationCap className="size-8 text-emerald-600 dark:text-emerald-400" />
                                    </Ring>
                                    <p className="mt-3 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                                        Training completed
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        All graded components are in
                                    </p>
                                </div>
                            ) : (
                                <div className="flex w-full flex-wrap items-center justify-center gap-6">
                                    <Ring value={percent} tone="sky" size={120}>
                                        <span className="text-2xl font-semibold tabular-nums">
                                            {percent}%
                                        </span>
                                        <span className="text-muted-foreground text-[11px]">
                                            complete
                                        </span>
                                    </Ring>
                                    <div className="grid min-w-40 flex-1 grid-cols-2 gap-3">
                                        <div className="bg-muted/60 rounded-xl p-3 text-center">
                                            <div className="text-2xl font-semibold text-sky-600 tabular-nums dark:text-sky-400">
                                                {trainee.current_phase ?? '—'}
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                Current Phase
                                            </div>
                                        </div>
                                        <div className="bg-muted/60 rounded-xl p-3 text-center">
                                            <div className="text-2xl font-semibold text-amber-600 tabular-nums dark:text-amber-400">
                                                {trainee.batch_ended
                                                    ? 'Ended'
                                                    : (trainee.remaining_days ?? '—')}
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                Days left
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <dl className="bg-muted/40 grid grid-cols-2 gap-3 border-t px-5 py-3 text-xs">
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

            <Panel title="Certificate status" icon={Award}>
                <div className="space-y-4 px-5 pt-1 pb-5">
                    <div className="flex items-center gap-4">
                        <IconChip
                            icon={issued ? CircleCheck : Award}
                            tone={issued ? 'emerald' : 'muted'}
                            className="size-12 [&>svg]:size-6"
                        />
                        {issued ? (
                            <div className="min-w-0">
                                <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                                    Certificate issued
                                </p>
                                <p className="text-muted-foreground text-xs">
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
                                <p className="text-sm font-semibold">Not issued yet</p>
                                <p className="text-muted-foreground text-xs">
                                    Your certificate will appear here once it is issued.
                                </p>
                            </div>
                        )}
                    </div>

                    {issued && trainee.certificate_id && (
                        <>
                            <FilePreview
                                src={CertificateController.preview.url(trainee.certificate_id)}
                                mime={trainee.certificate_mime}
                                title={`Certificate ${trainee.certificate_number ?? ''}`}
                            />
                            <div className="flex gap-2">
                                <Button asChild size="sm" variant="outline" className="rounded-xl">
                                    <a
                                        href={CertificateController.preview.url(trainee.certificate_id)}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Open in new tab
                                    </a>
                                </Button>
                                <Button asChild size="sm" className="rounded-xl">
                                    <a href={CertificateController.download.url(trainee.certificate_id)}>
                                        Download
                                    </a>
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Panel>
        </>
    );
}

/* ---------- Staff ---------- */

type Found = { group: string; stat: StatItem };
type Titled = Found & { title: string; icon: LucideIcon; tone: Tone };

type MetricSpec = {
    group?: string;
    label: string;
    title: string;
    icon: LucideIcon;
    tone: Tone;
};

// Ordered by operational importance. Stats a role cannot see are skipped.
const keyMetricSpecs: MetricSpec[] = [
    { group: 'Users', label: 'Active users', title: 'Active users', icon: Users, tone: 'blue' },
    {
        label: 'Active trainees without a batch',
        title: 'Trainees without a batch',
        icon: UserX,
        tone: 'amber',
    },
    {
        group: 'Violations',
        label: 'Last 30 days',
        title: 'Violations, 30 days',
        icon: TriangleAlert,
        tone: 'rose',
    },
    {
        group: 'Certificates',
        label: 'Pending',
        title: 'Pending certificates',
        icon: Award,
        tone: 'violet',
    },
    {
        label: 'Grades entered, last 7 days',
        title: 'Grades entered, 7 days',
        icon: ClipboardList,
        tone: 'teal',
    },
    {
        label: 'Trainees who passed the final exam',
        title: 'Passed final exam',
        icon: GraduationCap,
        tone: 'emerald',
    },
];

// Actionable when the value is above zero.
const attentionSpecs: MetricSpec[] = [
    {
        label: 'Active trainees without a batch',
        title: 'Trainees without a batch',
        icon: UserX,
        tone: 'amber',
    },
    {
        group: 'Certificates',
        label: 'Pending',
        title: 'Certificates pending',
        icon: Award,
        tone: 'amber',
    },
    {
        group: 'Violations',
        label: 'Last 30 days',
        title: 'Violations this month',
        icon: TriangleAlert,
        tone: 'amber',
    },
];

function findStat(groups: StatGroup[], spec: MetricSpec): Found | null {
    for (const g of groups) {
        if (spec.group && g.title !== spec.group) {
            continue;
        }

        const stat = g.stats.find((s) => s.label === spec.label);

        if (stat) {
            return { group: g.title, stat };
        }
    }

    return null;
}

function resolve(groups: StatGroup[], specs: MetricSpec[]): Titled[] {
    return specs.flatMap((spec) => {
        const found = findStat(groups, spec);

        return found
            ? [{ ...found, title: spec.title, icon: spec.icon, tone: spec.tone }]
            : [];
    });
}

function KpiCard({
    title,
    value,
    href,
    sub,
    icon,
    tone,
    emphasis,
}: {
    title: string;
    value: number;
    href: string | null;
    sub: string;
    icon: LucideIcon;
    tone: Tone;
    emphasis?: boolean;
}) {
    const content = (
        <>
            <div className="flex items-start justify-between">
                <IconChip icon={icon} tone={tone} />
                {href && (
                    <ArrowUpRight
                        aria-hidden="true"
                        className="text-muted-foreground size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                )}
            </div>
            <div
                className={cn(
                    'mt-5 text-4xl leading-none font-semibold tracking-tight tabular-nums',
                    emphasis && value > 0 && toneText.amber,
                )}
            >
                {value}
            </div>
            <div className="mt-2 text-sm font-medium">{title}</div>
            <div className="text-muted-foreground text-xs">{sub}</div>
        </>
    );

    const base = cn(card, 'group block p-5');

    return href ? (
        <Link
            href={href}
            className={cn(
                base,
                'hover:border-foreground/20 transition hover:shadow-md',
                focusRing,
            )}
        >
            {content}
        </Link>
    ) : (
        <div className={base}>{content}</div>
    );
}

function NeedsAttention({ items }: { items: Titled[] }) {
    const open = items.filter((i) => i.stat.value > 0);

    if (open.length === 0) {
        return (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3.5 text-sm">
                <CircleCheck
                    aria-hidden="true"
                    className="size-5 text-emerald-600 dark:text-emerald-400"
                />
                Nothing needs attention right now.
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-2">
            <p className="flex items-center gap-2 px-3 pt-2 pb-1 text-sm font-semibold text-amber-700 dark:text-amber-400">
                <TriangleAlert aria-hidden="true" className="size-4" />
                Needs attention
            </p>
            <ul className="grid gap-2 p-1 sm:grid-cols-2 lg:grid-cols-3">
                {open.map(({ title, stat, group, icon: Icon }) => {
                    const row = (
                        <>
                            <span
                                className={cn(
                                    'flex size-10 shrink-0 items-center justify-center rounded-xl text-base font-semibold tabular-nums',
                                    tones.amber,
                                )}
                            >
                                {stat.value}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium">
                                    {title}
                                </span>
                                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                    <Icon aria-hidden="true" className="size-3" />
                                    {group}
                                </span>
                            </span>
                            {stat.href && (
                                <ChevronRight
                                    aria-hidden="true"
                                    className="text-muted-foreground size-4 shrink-0"
                                />
                            )}
                        </>
                    );
                    const cls =
                        'bg-card flex items-center gap-3 rounded-xl border p-3';

                    return (
                        <li key={`${group}-${stat.label}`}>
                            {stat.href ? (
                                <Link
                                    href={stat.href}
                                    className={cn(
                                        cls,
                                        'hover:border-foreground/20 transition hover:shadow-sm',
                                        focusRing,
                                    )}
                                >
                                    {row}
                                </Link>
                            ) : (
                                <div className={cls}>{row}</div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function MoreFigures({ groups }: { groups: StatGroup[] }) {
    const shown = groups.filter((g) => g.stats.length > 0);

    if (shown.length === 0) {
        return null;
    }

    return (
        <Panel title="All figures" icon={Layers}>
            <div className="grid gap-4 px-5 pt-1 pb-5 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((g) => {
                    const Icon = groupIcons[g.title] ?? Layers;

                    return (
                        <div key={g.title} className="bg-muted/40 rounded-xl p-4">
                            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                <Icon
                                    aria-hidden="true"
                                    className="text-muted-foreground size-4"
                                />
                                {g.title}
                            </h3>
                            <dl className="divide-border/60 divide-y text-sm">
                                {g.stats.map((s) => (
                                    <div
                                        key={s.label}
                                        className="flex items-baseline justify-between gap-3 py-2"
                                    >
                                        <dt className="text-muted-foreground">
                                            {s.href ? (
                                                <Link
                                                    href={s.href}
                                                    className={cn(
                                                        'hover:text-foreground rounded',
                                                        focusRing,
                                                    )}
                                                >
                                                    {s.label}
                                                </Link>
                                            ) : (
                                                s.label
                                            )}
                                        </dt>
                                        <dd className="font-semibold tabular-nums">
                                            {s.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    );
                })}
            </div>
        </Panel>
    );
}

function QuickActions({
    actions,
}: {
    actions: { label: string; href: string; icon: LucideIcon }[];
}) {
    return (
        <Panel title="Quick actions" icon={Zap}>
            <nav
                aria-label="Quick actions"
                className="grid gap-2 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-1"
            >
                {actions.map((a, i) => (
                    <Link
                        key={a.href}
                        href={a.href}
                        className={cn(
                            'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                            focusRing,
                            i === 0
                                ? 'bg-primary text-primary-foreground border-transparent shadow-sm hover:opacity-90'
                                : 'hover:bg-muted/60',
                        )}
                    >
                        <a.icon aria-hidden="true" className="size-4 shrink-0" />
                        <span className="flex-1">{a.label}</span>
                        <ChevronRight
                            aria-hidden="true"
                            className="size-4 shrink-0 opacity-60"
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
    const maxMembers = Math.max(1, ...shown.map((b) => Number(b.members)));

    return (
        <Panel
            title="Batch overview"
            icon={Layers}
            aside={
                href ? (
                    <Link
                        href={href}
                        className={cn(
                            'text-muted-foreground hover:text-foreground rounded text-xs font-medium',
                            focusRing,
                        )}
                    >
                        Manage
                    </Link>
                ) : undefined
            }
        >
            {batches.length === 0 ? (
                <p className="text-muted-foreground px-5 pb-6 text-center text-sm">
                    No batches yet.
                </p>
            ) : (
                <ul className="space-y-3 px-5 pb-4">
                    {shown.map((b) => (
                        <li key={b.id}>
                            <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                                <span className="truncate font-medium">
                                    {b.name}
                                </span>
                                <span
                                    className="text-muted-foreground text-xs tabular-nums"
                                    aria-label={`${b.members} trainees`}
                                >
                                    {b.members} trainees
                                </span>
                            </div>
                            <Meter
                                label={b.name}
                                value={Number(b.members)}
                                total={maxMembers}
                                barClass={toneBar.violet}
                            />
                        </li>
                    ))}
                    {extra > 0 && (
                        <li className="text-muted-foreground text-xs">
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
                <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium">
                    {sum} in {n} weeks
                </span>
            }
        >
            <div className="px-5 pb-5">
                {max === 0 ? (
                    <p className="text-muted-foreground py-10 text-center text-sm">
                        Nothing recorded in the last {n} weeks.
                    </p>
                ) : (
                    <>
                        <div className="text-muted-foreground mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                            {trend.series.map((s) => (
                                <span
                                    key={s.label}
                                    className="flex items-center gap-1.5"
                                >
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            'size-2.5 rounded-full',
                                            (seriesStyles[s.label] ?? fallbackSeries).dot,
                                        )}
                                    />
                                    {s.label}
                                </span>
                            ))}
                            <span className="ml-auto tabular-nums">
                                Peak: {max}
                            </span>
                        </div>

                        <div role="img" aria-label={summary} className="h-44">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data}
                                    barGap={3}
                                    margin={{ top: 4, right: 8, bottom: 0, left: -24 }}
                                >
                                    <CartesianGrid
                                        vertical={false}
                                        strokeDasharray="3 3"
                                        stroke="var(--border)"
                                    />
                                    <XAxis
                                        dataKey="week"
                                        tickFormatter={formatWeek}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        domain={[0, (dataMax: number) => Math.max(dataMax, 3)]}
                                        tickCount={4}
                                        tickLine={false}
                                        axisLine={false}
                                        width={40}
                                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                                        labelFormatter={(w) => `Week of ${formatWeek(String(w))}`}
                                        contentStyle={{
                                            fontSize: 12,
                                            borderRadius: 12,
                                            background: 'var(--popover)',
                                            color: 'var(--popover-foreground)',
                                            border: '1px solid var(--border)',
                                            boxShadow: '0 8px 24px rgb(0 0 0 / 0.12)',
                                        }}
                                    />
                                    {trend.series.map((s) => (
                                        <Bar
                                            key={s.label}
                                            dataKey={s.label}
                                            fill={(seriesStyles[s.label] ?? fallbackSeries).color}
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={16}
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
            <div className="max-h-72 overflow-auto border-t">
                <table className="w-full text-sm">
                    <thead className="bg-muted/60 text-muted-foreground sticky top-0 text-left text-xs backdrop-blur">
                        <tr>
                            <th className="px-5 py-2.5 font-medium">When</th>
                            <th className="px-3 py-2.5 font-medium">Who</th>
                            <th className="px-3 py-2.5 font-medium">Action</th>
                            <th className="px-3 py-2.5 font-medium">Subject</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activity.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-muted-foreground px-5 py-8 text-center"
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
                                <td className="text-muted-foreground px-5 py-2.5 whitespace-nowrap tabular-nums">
                                    {item.occurred_at
                                        ? new Date(item.occurred_at).toLocaleString()
                                        : ''}
                                </td>
                                <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                                    {item.actor}
                                </td>
                                <td className="px-3 py-2.5 whitespace-nowrap">
                                    <span className="bg-muted rounded-md px-2 py-0.5 text-xs">
                                        {item.action}
                                    </span>
                                </td>
                                <td className="text-muted-foreground px-3 py-2.5">
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

    const key = resolve(groups, keyMetricSpecs);
    const attention = resolve(groups, attentionSpecs);

    // Everything not already shown as a key figure goes into "All figures".
    const keyIds = new Set(key.map((k) => `${k.group}|${k.stat.label}`));
    const rest = groups.map((g) => ({
        ...g,
        stats: g.stats.filter((s) => !keyIds.has(`${g.title}|${s.label}`)),
    }));

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

    const traineePercent =
        trainee && Number(trainee.grades_total) > 0
            ? Math.min(
                  100,
                  Math.round(
                      (Number(trainee.grades_entered) /
                          Number(trainee.grades_total)) *
                          100,
                  ),
              )
            : 0;

    return (
        <>
            <Head title="Dashboard" />
            <LiveGrades
                only={
                    mode === 'trainee'
                        ? ['trainee']
                        : ['batches', 'groups', 'activity', 'trend']
                }
            />

            <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
                {mode === 'trainee' ? (
                    <>
                        <LiveBatchAssignment />
                        <Hero
                            deco={Stethoscope}
                            title={name}
                            subtitle={
                                trainee
                                    ? `${trainee.batch ?? 'No batch assigned'}. Here is where your training stands today.`
                                    : 'Here is where your training stands today.'
                            }
                            aside={
                                trainee ? (
                                    <Ring value={traineePercent} tone="sky" size={104}>
                                        <span className="text-xl font-semibold tabular-nums">
                                            {traineePercent}%
                                        </span>
                                    </Ring>
                                ) : undefined
                            }
                        />
                        {trainee && <TraineeView trainee={trainee} />}
                    </>
                ) : (
                    <>
                        <Hero
                            title={name}
                            subtitle="Figures shown are limited to what your role can access."
                            chips={attention
                                .filter((a) => a.stat.value > 0)
                                .map((a) => ({
                                    label: a.title,
                                    value: a.stat.value,
                                    tone: 'amber' as Tone,
                                }))}
                        />

                        {groups.length === 0 && (
                            <p className="text-muted-foreground text-sm">
                                Your role has no dashboard figures.
                            </p>
                        )}

                        {attention.length > 0 && (
                            <NeedsAttention items={attention} />
                        )}

                        {key.length > 0 && (
                            <>
                                <SectionTitle>Key figures</SectionTitle>
                                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                                    {key.map(({ group, stat, title, icon, tone }) => (
                                        <KpiCard
                                            key={`${group}-${stat.label}`}
                                            title={title}
                                            value={stat.value}
                                            href={stat.href}
                                            sub={group}
                                            icon={icon}
                                            tone={tone}
                                            emphasis={
                                                stat.label ===
                                                'Active trainees without a batch'
                                            }
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {(trend || side) && (
                            <div className="grid items-start gap-4 lg:grid-cols-3">
                                {trend && (
                                    <TrendPanel
                                        trend={trend}
                                        className={side ? 'lg:col-span-2' : 'lg:col-span-3'}
                                    />
                                )}
                                {side && (
                                    <div
                                        className={cn(
                                            'space-y-4',
                                            !trend && 'lg:col-span-3',
                                        )}
                                    >
                                        {batches != null && (
                                            <BatchOverview
                                                batches={batches}
                                                href={batchesHref}
                                            />
                                        )}
                                        {actions.length > 0 && (
                                            <QuickActions actions={actions} />
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <MoreFigures groups={rest} />

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