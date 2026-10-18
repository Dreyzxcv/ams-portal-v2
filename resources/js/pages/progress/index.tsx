import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ProgressController from '@/actions/App/Http/Controllers/Progress/ProgressController';
import Heading from '@/components/heading';
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

export default function ProgressIndex({ trainees, filters, max_phase, days_configured }: Props) {
    const [search, setSearch] = useState(filters.search);

    return (
        <>
            <Head title="Progress" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Progress"
                    description={`Current phase (1 to ${max_phase}) and estimated days remaining per active trainee`}
                />

                {!days_configured && (
                    <p className="text-muted-foreground rounded-lg border p-3 text-sm">
                        Remaining days are not available yet because the total program length has not been configured.
                    </p>
                )}

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
                    <Input
                        className="w-64"
                        type="search"
                        placeholder="Search name or username"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        aria-label="Search trainees"
                    />
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </form>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Trainee</th>
                                <th className="px-4 py-3 font-medium">Phase</th>
                                <th className="px-4 py-3 font-medium">Start date</th>
                                <th className="px-4 py-3 font-medium">Days remaining</th>
                                <th className="px-4 py-3 font-medium">Last update</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {trainees.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-muted-foreground px-4 py-8 text-center">
                                        No trainees found.
                                    </td>
                                </tr>
                            )}
                            {trainees.data.map((t) => (
                                <tr key={t.id} className="border-t">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{t.name}</div>
                                        <div className="text-muted-foreground font-mono text-xs">{t.username}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {t.current_phase ?? <span className="text-muted-foreground">Not set</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        {t.started_on ?? <span className="text-muted-foreground">Not set</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        {t.remaining_days ?? <span className="text-muted-foreground">-</span>}
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
                                    <td className="px-4 py-3 text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={ProgressController.edit(t.id)}>Update</Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">
                        {trainees.total === 0
                            ? 'No trainees'
                            : `Showing ${trainees.from} to ${trainees.to} of ${trainees.total}`}
                    </p>
                    <div className="flex gap-2">
                        {trainees.prev_page_url && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={trainees.prev_page_url} preserveScroll>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        {trainees.next_page_url && (
                            <Button asChild variant="outline" size="sm">
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