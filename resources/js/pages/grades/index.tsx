import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import GradeController from '@/actions/App/Http/Controllers/Grades/GradeController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { GradeComponentInfo, TraineeGradeRow } from '@/types/grades';
import type { Paginated } from '@/types/users';

type Props = {
    trainees: Paginated<TraineeGradeRow>;
    components: GradeComponentInfo[];
    filters: { search: string };
};

export default function GradesIndex({ trainees, components, filters }: Props) {
    const [search, setSearch] = useState(filters.search);

    return (
        <>
            <Head title="Grades" />

            <div className="space-y-6 p-4">
                <Heading title="Grades" description="Trainee scores per phase and the final examination" />

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
                                {components.map((c) => (
                                    <th key={c.id} className="px-4 py-3 font-medium whitespace-nowrap">
                                        {c.label}
                                        <div className="text-muted-foreground text-xs font-normal">
                                            /{Number(c.max_score)} (pass {Number(c.pass_score)})
                                        </div>
                                    </th>
                                ))}
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {trainees.data.length === 0 && (
                                <tr>
                                    <td colSpan={components.length + 2} className="text-muted-foreground px-4 py-8 text-center">
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
                                    {components.map((c) => {
                                        const score = t.scores[c.id];
                                        const failed = score != null && Number(score) < Number(c.pass_score);

                                        return (
                                            <td
                                                key={c.id}
                                                className={failed ? 'px-4 py-3 text-red-600 dark:text-red-400' : 'px-4 py-3'}
                                            >
                                                {score == null ? <span className="text-muted-foreground">-</span> : Number(score)}
                                            </td>
                                        );
                                    })}
                                    <td className="px-4 py-3 text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={GradeController.show(t.id)}>Open</Link>
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

GradesIndex.layout = {
    breadcrumbs: [{ title: 'Grades', href: GradeController.index() }],
};