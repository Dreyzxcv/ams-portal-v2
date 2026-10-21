import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { create, index } from '@/routes/announcements';
import AnnouncementForm from './form';

export default function Create() {
    return (
        <>
            <Head title="New announcement" />

            <div className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div className="flex items-center gap-4">
                        <span
                            aria-hidden="true"
                            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        >
                            <Megaphone className="size-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">New announcement</h1>
                            <p className="text-muted-foreground text-sm">Save as draft or publish to the portal and Discord</p>
                        </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="bg-background/70 rounded-xl">
                        <Link href={index.url()}>
                            <ArrowLeft className="size-4" aria-hidden="true" />
                            Back
                        </Link>
                    </Button>
                </div>

                <AnnouncementForm />
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Announcements', href: index() },
        { title: 'New', href: create() },
    ],
};