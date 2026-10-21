import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/announcements';
import type { ManagedAnnouncement } from '@/types/announcement';
import AnnouncementForm from './form';

export default function Edit({ announcement }: { announcement: ManagedAnnouncement }) {
    return (
        <>
            <Head title="Edit announcement" />

            <div className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div className="flex min-w-0 items-center gap-4">
                        <span
                            aria-hidden="true"
                            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        >
                            <Megaphone className="size-6" />
                        </span>
                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                                Edit announcement
                            </h1>
                            <p className="text-muted-foreground truncate text-sm">RE: {announcement.subject}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                                announcement.is_published
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-muted text-muted-foreground'
                            }`}
                        >
                            {announcement.is_published ? 'Published' : 'Draft'}
                        </span>
                        <Button asChild variant="outline" size="sm" className="bg-background/70 rounded-xl">
                            <Link href={index.url()}>
                                <ArrowLeft className="size-4" aria-hidden="true" />
                                Back
                            </Link>
                        </Button>
                    </div>
                </div>

                <AnnouncementForm announcement={announcement} />
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Announcements', href: index() },
        { title: 'Edit', href: index() },
    ],
};