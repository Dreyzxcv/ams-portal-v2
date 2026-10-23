import { Head, Link, router } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import GradeController from '@/actions/App/Http/Controllers/Grades/GradeController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { GradeComponentInfo, TraineeGradeRow } from '@/types/grades';
import type { Paginated } from '@/types/users';

type Props = {
    trainees: Paginated<TraineeGradeRow>;
    components: GradeComponentInfo[];
    filters: { search: string };
};

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('');
}

export default function GradesIndex({ trainees, components, filters }: Props) {
    const [search, setSearch] = useState(filters.search);

    useEcho(
        'staff',
        '.grades.changed',
        () => router.reload({ only: ['trainees'] }),
        [],
    );

    return (
        <>
            <Head title="Grades" />

            <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Grades
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Trainee scores per phase and the final examination
                        </p>
                    </div>

                    <form
                        className="flex items-center gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get(
                                GradeController.index.url(),
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

                <div className="bg-card overflow-hidden rounded-2xl border shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/60 text-muted-foreground text-left text-xs">
                                <tr>
                                    <th className="px-5 py-3 font-medium">
                                        Trainee
                                    </th>
                                    {components.map((c) => (
                                        <th
                                            key={c.id}
                                            className="px-4 py-3 font-medium whitespace-nowrap"
                                        >
                                            <div className="text-foreground">
                                                {c.label}
                                            </div>
                                            <div className="font-normal">
                                                Out of {Number(c.max_score)}, pass at{' '}
                                                {Number(c.pass_score)}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-5 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {trainees.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={components.length + 2}
                                            className="text-muted-foreground px-5 py-12 text-center"
                                        >
                                            No trainees found.
                                        </td>
                                    </tr>
                                )}
                                {trainees.data.map((t) => (
                                    <tr
                                        key={t.id}
                                        className="hover:bg-muted/40 border-t transition-colors"
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    aria-hidden="true"
                                                    className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-xs font-semibold text-sky-700 dark:text-sky-300"
                                                >
                                                    {initials(t.name)}
                                                </span>
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">
                                                        {t.name}
                                                    </div>
                                                    <div className="text-muted-foreground text-xs">
                                                        @{t.username}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {components.map((c) => {
                                            const score = t.scores[c.id];
                                            const has = score != null;
                                            const failed =
                                                has &&
                                                Number(score) < Number(c.pass_score);

                                            return (
                                                <td key={c.id} className="px-4 py-3">
                                                    <span
                                                        className={cn(
                                                            'inline-flex min-w-10 justify-center rounded-lg px-2.5 py-1 text-sm font-medium tabular-nums',
                                                            !has
                                                                ? 'text-muted-foreground'
                                                                : failed
                                                                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                                                                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
                                                        )}
                                                    >
                                                        {has ? Number(score) : '-'}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                        <td className="px-5 py-3 text-right">
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl"
                                            >
                                                <Link href={GradeController.show(t.id)}>
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
                        {trainees.total === 0
                            ? 'No trainees'
                            : `Showing ${trainees.from} to ${trainees.to} of ${trainees.total}`}
                    </p>
                    <div className="flex gap-2">
                        {trainees.prev_page_url && (
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                            >
                                <Link href={trainees.prev_page_url} preserveScroll>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        {trainees.next_page_url && (
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                            >
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

GradesIndex.layout = {
    breadcrumbs: [{ title: 'Grades', href: GradeController.index() }],
};