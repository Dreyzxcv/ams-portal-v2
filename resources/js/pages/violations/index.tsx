import { Form, Head, Link, router } from '@inertiajs/react';
import { Plus, Search, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import ViolationController from '@/actions/App/Http/Controllers/Violations/ViolationController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Paginated } from '@/types/users';
import type { ViolationRow } from '@/types/violations';

type Props = {
    violations: Paginated<ViolationRow>;
    filters: { search: string };
    can: { create: boolean };
};

function initials(name: string | null) {
    return (name ?? '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('');
}

export default function ViolationsIndex({ violations, filters, can }: Props) {
    const [search, setSearch] = useState(filters.search);

    return (
        <>
            <Head title="Violations" />

            <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div className="flex items-center gap-4">
                        <span
                            aria-hidden="true"
                            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        >
                            <TriangleAlert className="size-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Violations</h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Recorded violations and who issued them
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {can.create && (
                            <form
                                className="flex items-center gap-2"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    router.get(
                                        ViolationController.index.url(),
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
                                        placeholder="Search trainee name or username"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        aria-label="Search violations"
                                    />
                                </div>
                                <Button type="submit" variant="outline" className="bg-background/70 rounded-xl">
                                    Search
                                </Button>
                            </form>
                        )}
                        {can.create && (
                            <Button asChild className="rounded-xl">
                                <Link href={ViolationController.create()}>
                                    <Plus />
                                    New violation
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
                                    <th className="px-5 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium">Trainee</th>
                                    <th className="px-4 py-3 font-medium">Description</th>
                                    <th className="px-4 py-3 font-medium">Issued by</th>
                                    <th className="px-5 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {violations.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-muted-foreground px-5 py-12 text-center">
                                            No violations found.
                                        </td>
                                    </tr>
                                )}
                                {violations.data.map((v) => (
                                    <tr key={v.id} className="hover:bg-muted/40 border-t align-top transition-colors">
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            <span className="bg-rose-500/10 inline-flex rounded-full px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-400">
                                                {v.occurred_on}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    aria-hidden="true"
                                                    className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-xs font-semibold text-sky-700 dark:text-sky-300"
                                                >
                                                    {initials(v.trainee_name)}
                                                </span>
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">{v.trainee_name}</div>
                                                    <div className="text-muted-foreground text-xs">
                                                        @{v.trainee_username}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="max-w-md px-4 py-3 break-words whitespace-pre-wrap">
                                            {v.description}
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3">{v.issued_by ?? '-'}</td>
                                        <td className="px-5 py-3">
                                            {v.can_edit && (
                                                <div className="flex justify-end gap-2">
                                                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                                                        <Link href={ViolationController.edit(v.id)}>Edit</Link>
                                                    </Button>
                                                    <Form
                                                        {...ViolationController.destroy.form(v.id)}
                                                        options={{ preserveScroll: true }}
                                                        onBefore={() => window.confirm('Delete this violation?')}
                                                    >
                                                        {({ processing }) => (
                                                            <Button
                                                                type="submit"
                                                                variant="destructive"
                                                                size="sm"
                                                                disabled={processing}
                                                                className="rounded-xl"
                                                            >
                                                                Delete
                                                            </Button>
                                                        )}
                                                    </Form>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex items-center justify-between px-1 text-sm">
                    <p className="text-muted-foreground">
                        {violations.total === 0
                            ? 'No violations'
                            : `Showing ${violations.from} to ${violations.to} of ${violations.total}`}
                    </p>
                    <div className="flex gap-2">
                        {violations.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href={violations.prev_page_url} preserveScroll>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        {violations.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href={violations.next_page_url} preserveScroll>
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

ViolationsIndex.layout = {
    breadcrumbs: [{ title: 'Violations', href: ViolationController.index() }],
};