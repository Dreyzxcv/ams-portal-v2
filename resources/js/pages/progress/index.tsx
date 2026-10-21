import { Head, Link, router } from '@inertiajs/react';
import { Hourglass, Info, Search } from 'lucide-react';
import { useState } from 'react';
import ProgressController from '@/actions/App/Http/Controllers/Progress/ProgressController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ProgressRow } from '@/types/progress';
import type { Paginated } from '@/types/users';

type Props = {
    trainees: Paginated<ProgressRow>;
    filters: { search: string };
    max_phase: number;
    days_configured: boolean;
};

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('');
}

const pill = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium';

export default function ProgressIndex({ trainees, filters, max_phase, days_configured }: Props) {
    const [search, setSearch] = useState(filters.search);

    return (
        <>
            <Head title="Progress" />

            <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div className="flex items-center gap-4">
                        <span
                            aria-hidden="true"
                            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400"
                        >
                            <Hourglass className="size-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Progress</h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Current phase (1 to {max_phase}) and estimated days left per active trainee
                            </p>
                        </div>
                    </div>

                    <form
                        className="flex items-center gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get(
                                ProgressController.index.url(),
                                search.trim() ? { search: search.trim() } : {},
                                { preserveState: true, replace: true },
                            );
                        }}
                    >
                        <div className="relative">
                            <Search
                                aria-hidden="true"
                                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                            />
                            <Input
                                className="bg-background/70 w-64 rounded-xl pl-9"
                                type="search"
                                placeholder="Search name or username"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                aria-label="Search trainees"
                            />
                        </div>
                        <Button type="submit" className="rounded-xl">
                            Search
                        </Button>
                    </form>
                </div>

                {!days_configured && (
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                        Remaining days are not available yet because the total program length has not been configured.
                    </div>
                )}

                <div className="bg-card overflow-hidden rounded-2xl border shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/60 text-muted-foreground text-left text-xs">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Trainee</th>
                                    <th className="px-4 py-3 font-medium">Phase</th>
                                    <th className="px-4 py-3 font-medium">Start date</th>
                                    <th className="px-4 py-3 font-medium">Days remaining</th>
                                    <th className="px-4 py-3 font-medium">Last update</th>
                                    <th className="px-5 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {trainees.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-muted-foreground px-5 py-12 text-center">
                                            No trainees found.
                                        </td>
                                    </tr>
                                )}
                                {trainees.data.map((t) => (
                                    <tr key={t.id} className="hover:bg-muted/40 border-t transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    aria-hidden="true"
                                                    className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-xs font-semibold text-sky-700 dark:text-sky-300"
                                                >
                                                    {initials(t.name)}
                                                </span>
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">{t.name}</div>
                                                    <div className="text-muted-foreground text-xs">@{t.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {t.current_phase != null ? (
                                                <span className={`${pill} bg-sky-500/10 text-sky-700 dark:text-sky-300`}>
                                                    Phase {t.current_phase}
                                                </span>
                                            ) : (
                                                <span className={`${pill} bg-muted text-muted-foreground`}>Not set</span>
                                            )}
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3">
                                            {t.started_on ?? 'Not set'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {t.remaining_days != null ? (
                                                <span className="font-semibold tabular-nums">{t.remaining_days}</span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3">
                                            {t.updated_at ? (
                                                <>
                                                    <div>{new Date(t.updated_at).toLocaleString()}</div>
                                                    {t.updated_by && <div className="text-xs">by {t.updated_by}</div>}
                                                </>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                                <Link href={ProgressController.edit(t.id)}>Update</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex items-center justify-between px-1 text-sm">
                    <p className="text-muted-foreground">
                        {trainees.total === 0
                            ? 'No trainees'
                            : `Showing ${trainees.from} to ${trainees.to} of ${trainees.total}`}
                    </p>
                    <div className="flex gap-2">
                        {trainees.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href={trainees.prev_page_url} preserveScroll>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        {trainees.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href={trainees.next_page_url} preserveScroll>
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

ProgressIndex.layout = {
    breadcrumbs: [{ title: 'Progress', href: ProgressController.index() }],
};