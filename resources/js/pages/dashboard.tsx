import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { dashboard } from '@/routes';
import type {
    ActivityItem,
    StatGroup,
    StatItem,
    TraineeSummary,
} from '@/types/dashboard';

type Props = {
    mode: 'staff' | 'trainee';
    groups: StatGroup[];
    activity: ActivityItem[] | null;
    trainee: TraineeSummary | null;
};

function StatCard({ label, value, href }: StatItem) {
    const body = (
        <div className="h-full rounded-xl border p-4 transition-colors hover:bg-muted/40">
            <div className="text-muted-foreground text-sm">{label}</div>
            <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
        </div>
    );

    return href ? (
        <Link href={href} className="block">
            {body}
        </Link>
    ) : (
        <div className="[&>div]:hover:bg-transparent">{body}</div>
    );
}

function Fact({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-xl border p-4">
            <div className="text-muted-foreground text-sm">{label}</div>
            <div className="mt-1 text-xl font-semibold">{value}</div>
        </div>
    );
}

export default function Dashboard({ mode, groups, activity, trainee }: Props) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="space-y-8 p-4">
                <Heading
                    title="Dashboard"
                    description={
                        mode === 'trainee'
                            ? 'Your progress at a glance'
                            : 'Figures shown are limited to what your role can access'
                    }
                />

                {mode === 'trainee' && trainee && (
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Fact label="Batch" value={trainee.batch ?? 'Not assigned'} />
                        <Fact
                            label="Current phase"
                            value={trainee.current_phase ?? 'Not set'}
                        />
                        <Fact label="Started on" value={trainee.started_on ?? 'Not set'} />
                        <Fact
                            label="Estimated days remaining"
                            value={trainee.remaining_days ?? 'Not available'}
                        />
                        <Fact
                            label="Grades entered"
                            value={`${trainee.grades_entered} of ${trainee.grades_total}`}
                        />
                        <Fact
                            label="Grades passed"
                            value={`${trainee.grades_passed} of ${trainee.grades_total}`}
                        />
                        <Fact label="Violations on record" value={trainee.violations} />
                        <Fact
                            label="Certificate"
                            value={
                                trainee.certificate_number
                                    ? `${trainee.certificate_number} (${trainee.certificate_issued_at})`
                                    : 'Not issued yet'
                            }
                        />
                    </section>
                )}

                {mode === 'staff' && groups.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                        Your role has no dashboard figures.
                    </p>
                )}

                {groups.map((group) => (
                    <section key={group.title} className="space-y-3">
                        <h2 className="text-base font-medium">{group.title}</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {group.stats.map((stat) => (
                                <StatCard key={stat.label} {...stat} />
                            ))}
                        </div>
                    </section>
                ))}

                {activity && (
                    <section className="space-y-3">
                        <h2 className="text-base font-medium">Recent activity</h2>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">When</th>
                                        <th className="px-4 py-3 font-medium">Who</th>
                                        <th className="px-4 py-3 font-medium">Action</th>
                                        <th className="px-4 py-3 font-medium">Subject</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activity.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="text-muted-foreground px-4 py-8 text-center"
                                            >
                                                No activity yet.
                                            </td>
                                        </tr>
                                    )}
                                    {activity.map((item) => (
                                        <tr key={item.id} className="border-t">
                                            <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                                                {item.occurred_at
                                                    ? new Date(item.occurred_at).toLocaleString()
                                                    : ''}
                                            </td>
                                            <td className="px-4 py-3 font-mono">{item.actor}</td>
                                            <td className="px-4 py-3 font-mono">{item.action}</td>
                                            <td className="text-muted-foreground px-4 py-3">
                                                {item.subject ?? ''}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};