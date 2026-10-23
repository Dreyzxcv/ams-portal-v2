import { Head, Link, router } from '@inertiajs/react';
import { Layers, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import BatchController from '@/actions/App/Http/Controllers/Batches/BatchController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LiveBatchData } from '@/components/live-grades';
import type { BatchRow } from '@/types/batches';
import type { Paginated } from '@/types/users';

type Props = {
    batches: Paginated<BatchRow>;
    filters: { search: string };
    can: { create: boolean };
};

export default function BatchesIndex({ batches, filters, can }: Props) {
    const [search, setSearch] = useState(filters.search);

    return (
        <>
            <Head title="Batches" />
            <LiveBatchData only={['batches']} />

            <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Batches
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Manage batches and their trainees
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <form
                            className="flex items-center gap-2"
                            onSubmit={(event) => {
                                event.preventDefault();
                                router.get(
                                    BatchController.index.url(),
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
                                    className="bg-background/70 w-56 rounded-xl pl-9"
                                    type="search"
                                    placeholder="Search batch name"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    aria-label="Search batches"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="outline"
                                className="bg-background/70 rounded-xl"
                            >
                                Search
                            </Button>
                        </form>
                        {can.create && (
                            <Button asChild className="rounded-xl">
                                <Link href={BatchController.create()}>
                                    <Plus />
                                    New batch
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="bg-card overflow-hidden rounded-2xl border shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/60 text-muted-foreground text-left text-xs">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Batch</th>
                                    <th className="px-4 py-3 font-medium">Start date</th>
                                    <th className="px-4 py-3 font-medium">Trainees</th>
                                    <th className="px-5 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {batches.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="text-muted-foreground px-5 py-12 text-center"
                                        >
                                            No batches found.
                                        </td>
                                    </tr>
                                )}
                                {batches.data.map((batch) => (
                                    <tr
                                        key={batch.id}
                                        className="hover:bg-muted/40 border-t transition-colors"
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    aria-hidden="true"
                                                    className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400"
                                                >
                                                    <Layers className="size-4" />
                                                </span>
                                                <span className="font-medium">
                                                    {batch.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3">
                                            {batch.starts_on ?? 'Not set'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="bg-muted inline-flex min-w-8 justify-center rounded-full px-2.5 py-1 text-xs font-medium tabular-nums">
                                                {batch.trainee_count}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl"
                                            >
                                                <Link href={BatchController.show(batch.id)}>
                                                    Open
                                                </Link>
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
                        {batches.total === 0
                            ? 'No batches'
                            : `Showing ${batches.from} to ${batches.to} of ${batches.total}`}
                    </p>
                    <div className="flex gap-2">
                        {batches.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href={batches.prev_page_url} preserveScroll>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        {batches.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href={batches.next_page_url} preserveScroll>
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

BatchesIndex.layout = {
    breadcrumbs: [{ title: 'Batches', href: BatchController.index() }],
};