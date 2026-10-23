import { Head, Link, router } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { ArrowLeft, ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';
import AnnouncementMemo from '@/components/announcement-memo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import type { PublicAnnouncement } from '@/types/announcement';

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
};

const pageBtn =
    'inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-xl border px-3 text-sm font-medium transition-colors';

export default function AnnouncementsArchive({
    announcements,
}: {
    announcements: Paginated<PublicAnnouncement>;
}) {
    useEcho(
        'announcements',
        '.announcements.changed',
        () => router.reload({ only: ['announcements'] }),
        [],
        'public',
    );

    const { links, current_page, last_page } = announcements;

    // Laravel paginator: first link = Previous, last link = Next, middle = pages.
    const prev = links[0];
    const next = links[links.length - 1];
    const pages = links.slice(1, -1);

    return (
        <>
            <Head title="All announcements" />
            <div className="bg-background text-foreground min-h-screen">
                <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6">
                    <div className="space-y-4">
                        <Button asChild variant="ghost" size="sm" className="-ml-2 rounded-xl">
                            <Link href={home()}>
                                <ArrowLeft />
                                Back to home
                            </Link>
                        </Button>

                        <div className="flex items-start gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Megaphone aria-hidden="true" className="size-5" />
                            </span>
                            <div className="space-y-1">
                                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                    All announcements
                                </h1>
                                <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                                    Official notices, school orders, and phase updates from the
                                    Office of the Dean of Medicine.
                                </p>
                            </div>
                        </div>

                        {last_page > 1 && (
                            <p className="text-muted-foreground text-xs">
                                Page {current_page} of {last_page}
                            </p>
                        )}
                    </div>

                    {announcements.data.length > 0 ? (
                        <div className="space-y-4">
                            {announcements.data.map((a) => (
                                <AnnouncementMemo key={a.id} a={a} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 px-6 py-12 text-center">
                            <span className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Megaphone aria-hidden="true" className="size-5" />
                            </span>
                            <p className="text-base font-semibold">No announcements yet</p>
                            <p className="text-muted-foreground max-w-sm text-sm">
                                Announcements will show up here once the Office of the Dean posts
                                them.
                            </p>
                        </div>
                    )}

                    {last_page > 1 && (
                        <nav
                            aria-label="Pagination"
                            className="flex flex-wrap items-center justify-center gap-1.5"
                        >
                            {prev.url ? (
                                <Link href={prev.url} className={cn(pageBtn, 'hover:bg-muted')}>
                                    <ChevronLeft aria-hidden="true" className="size-4" />
                                    Prev
                                </Link>
                            ) : (
                                <span aria-disabled="true" className={cn(pageBtn, 'opacity-50')}>
                                    <ChevronLeft aria-hidden="true" className="size-4" />
                                    Prev
                                </span>
                            )}

                            {pages.map((l, i) =>
                                l.url ? (
                                    <Link
                                        key={i}
                                        href={l.url}
                                        aria-current={l.active ? 'page' : undefined}
                                        className={cn(
                                            pageBtn,
                                            l.active
                                                ? 'border-sky-600 bg-sky-600 text-white'
                                                : 'hover:bg-muted',
                                        )}
                                    >
                                        {l.label}
                                    </Link>
                                ) : (
                                    <span
                                        key={i}
                                        className="text-muted-foreground inline-flex h-9 min-w-9 items-center justify-center text-sm"
                                    >
                                        {l.label}
                                    </span>
                                ),
                            )}

                            {next.url ? (
                                <Link href={next.url} className={cn(pageBtn, 'hover:bg-muted')}>
                                    Next
                                    <ChevronRight aria-hidden="true" className="size-4" />
                                </Link>
                            ) : (
                                <span aria-disabled="true" className={cn(pageBtn, 'opacity-50')}>
                                    Next
                                    <ChevronRight aria-hidden="true" className="size-4" />
                                </span>
                            )}
                        </nav>
                    )}
                </main>
            </div>
        </>
    );
}