import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import BatchController from '@/actions/App/Http/Controllers/Batches/BatchController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading title="Batches" description="Manage batches and their trainees" />
                    {can.create && (
                        <Button asChild>
                            <Link href={BatchController.create()}>
                                <Plus />
                                New batch
                            </Link>
                        </Button>
                    )}
                </div>

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
                    <Input
                        className="w-64"
                        type="search"
                        placeholder="Search batch name"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        aria-label="Search batches"
                    />
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </form>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Start date</th>
                                <th className="px-4 py-3 font-medium">Trainees</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {batches.data.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-muted-foreground px-4 py-8 text-center">
                                        No batches found.
                                    </td>
                                </tr>
                            )}
                            {batches.data.map((batch) => (
                                <tr key={batch.id} className="border-t">
                                    <td className="px-4 py-3 font-medium">{batch.name}</td>
                                    <td className="text-muted-foreground px-4 py-3">
                                        {batch.starts_on ?? 'Not set'}
                                    </td>
                                    <td className="px-4 py-3">{batch.trainee_count}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={BatchController.show(batch.id)}>Open</Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">
                        {batches.total === 0
                            ? 'No batches'
                            : `Showing ${batches.from} to ${batches.to} of ${batches.total}`}
                    </p>
                    <div className="flex gap-2">
                        {batches.prev_page_url && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={batches.prev_page_url} preserveScroll>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        {batches.next_page_url && (
                            <Button asChild variant="outline" size="sm">
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