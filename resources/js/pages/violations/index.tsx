import { Form, Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import ViolationController from '@/actions/App/Http/Controllers/Violations/ViolationController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Paginated } from '@/types/users';
import type { ViolationRow } from '@/types/violations';

type Props = {
    violations: Paginated<ViolationRow>;
    filters: { search: string };
    can: { create: boolean };
};

export default function ViolationsIndex({ violations, filters, can }: Props) {
    const [search, setSearch] = useState(filters.search);

    return (
        <>
            <Head title="Violations" />

            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading title="Violations" description="Recorded violations and who issued them" />
                    {can.create && (
                        <Button asChild>
                            <Link href={ViolationController.create()}>
                                <Plus />
                                New violation
                            </Link>
                        </Button>
                    )}
                </div>

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
                        <Input
                            className="w-64"
                            type="search"
                            placeholder="Search trainee name or username"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            aria-label="Search violations"
                        />
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                )}

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Trainee</th>
                                <th className="px-4 py-3 font-medium">Description</th>
                                <th className="px-4 py-3 font-medium">Issued by</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {violations.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-muted-foreground px-4 py-8 text-center">
                                        No violations found.
                                    </td>
                                </tr>
                            )}
                            {violations.data.map((v) => (
                                <tr key={v.id} className="border-t align-top">
                                    <td className="px-4 py-3 whitespace-nowrap">{v.occurred_on}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{v.trainee_name}</div>
                                        <div className="text-muted-foreground font-mono text-xs">
                                            {v.trainee_username}
                                        </div>
                                    </td>
                                    <td className="max-w-md px-4 py-3 break-words whitespace-pre-wrap">
                                        {v.description}
                                    </td>
                                    <td className="text-muted-foreground px-4 py-3">{v.issued_by ?? '-'}</td>
                                    <td className="px-4 py-3">
                                        {v.can_edit && (
                                            <div className="flex justify-end gap-2">
                                                <Button asChild variant="outline" size="sm">
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

                <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">
                        {violations.total === 0
                            ? 'No violations'
                            : `Showing ${violations.from} to ${violations.to} of ${violations.total}`}
                    </p>
                    <div className="flex gap-2">
                        {violations.prev_page_url && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={violations.prev_page_url} preserveScroll>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        {violations.next_page_url && (
                            <Button asChild variant="outline" size="sm">
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