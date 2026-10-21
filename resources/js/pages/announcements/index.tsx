import { Head, Link, router, usePage } from '@inertiajs/react';
import { Megaphone, Pin, PinOff, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { create, destroy, edit, index, pin, publish, retry, unpin, unpublish } from '@/routes/announcements';
import type { DiscordStatus, ManagedAnnouncement } from '@/types/announcement';

type Paginated = {
    data: ManagedAnnouncement[];
    next_page_url: string | null;
    prev_page_url: string | null;
};

const discordLabel: Record<DiscordStatus, { text: string; cls: string }> = {
    not_sent: { text: 'Discord: not sent', cls: 'bg-muted text-muted-foreground' },
    sending: { text: 'Discord: sending…', cls: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
    sent: { text: 'Discord: sent', cls: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
    failed: { text: 'Discord: failed', cls: 'bg-rose-500/10 text-rose-700 dark:text-rose-400' },
};

const pill = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium';

const post = (url: string) => router.post(url, {}, { preserveScroll: true });

export default function Index({ announcements }: { announcements: Paginated }) {
    // Shown only if your app shares flash under `status`; the per-row badges below are the source of truth.
    const status = (usePage().props as { status?: string }).status;

    return (
        <>
            <Head title="Announcements" />

            <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div className="flex items-center gap-4">
                        <span
                            aria-hidden="true"
                            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        >
                            <Megaphone className="size-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Announcements</h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Draft, publish and pin notices shown on the public page
                            </p>
                        </div>
                    </div>
                    <Button asChild className="rounded-xl">
                        <Link href={create.url()}>
                            <Plus />
                            New announcement
                        </Link>
                    </Button>
                </div>

                {status && (
                    <p className="rounded-2xl border border-sky-500/25 bg-sky-500/10 px-4 py-3 text-sm">{status}</p>
                )}

                {announcements.data.length === 0 && (
                    <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-2xl border border-dashed px-4 py-12 text-center text-sm">
                        <Megaphone className="size-6" aria-hidden="true" />
                        <p className="text-foreground font-medium">No announcements yet</p>
                        <p>Create one to share it with trainees.</p>
                    </div>
                )}

                <ul className="space-y-3">
                    {announcements.data.map((a) => {
                        const d = discordLabel[a.discord_status];

                        return (
                            <li
                                key={a.id}
                                className="bg-card hover:border-foreground/20 space-y-4 rounded-2xl border p-5 shadow-xs transition hover:shadow-md"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold break-words">
                                            <span className="text-muted-foreground mr-1.5 text-xs font-semibold tracking-wide">
                                                RE:
                                            </span>
                                            {a.subject}
                                        </p>
                                        <p className="text-muted-foreground mt-1 text-xs break-words">
                                            To: {a.recipient} · From: {a.sender}
                                            {a.author ? ` · by ${a.author}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span
                                            className={`${pill} ${
                                                a.is_published
                                                    ? 'bg-sky-500/10 text-sky-700 dark:text-sky-400'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {a.is_published ? `Published ${a.published_label}` : 'Draft'}
                                        </span>
                                        {a.is_published && a.is_pinned && (
                                            <span className={`${pill} bg-amber-500/10 text-amber-700 dark:text-amber-400`}>
                                                <Pin aria-hidden="true" className="size-3" />
                                                Pinned
                                            </span>
                                        )}
                                        {a.is_published && <span className={`${pill} ${d.cls}`}>{d.text}</span>}
                                    </div>
                                </div>

                                {a.is_published && a.discord_status === 'failed' && (
                                    <p className="rounded-xl border border-rose-500/25 bg-rose-500/5 px-3 py-2 text-sm text-rose-700 dark:text-rose-400">
                                        {a.discord_error ?? 'Discord delivery failed.'} The announcement is live in the
                                        portal; retry to post it to Discord.
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2 border-t pt-4">
                                    <Button asChild size="sm" variant="outline" className="rounded-xl">
                                        <Link href={edit.url(a.id)}>Edit</Link>
                                    </Button>
                                    {!a.is_published && (
                                        <Button size="sm" className="rounded-xl" onClick={() => post(publish.url(a.id))}>
                                            Publish
                                        </Button>
                                    )}
                                    {a.is_published && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-xl"
                                            onClick={() => post(unpublish.url(a.id))}
                                        >
                                            Unpublish
                                        </Button>
                                    )}
                                    {a.is_published && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-xl"
                                            onClick={() => post(a.is_pinned ? unpin.url(a.id) : pin.url(a.id))}
                                        >
                                            {a.is_pinned ? <PinOff /> : <Pin />}
                                            {a.is_pinned ? 'Unpin' : 'Pin'}
                                        </Button>
                                    )}
                                    {a.is_published && (a.discord_status === 'failed' || a.discord_status === 'sending') && (
                                        <Button size="sm" className="rounded-xl" onClick={() => post(retry.url(a.id))}>
                                            Retry Discord
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="ml-auto rounded-xl"
                                        onClick={() => {
                                            if (window.confirm('Remove this announcement? A copy already in Discord is not deleted.')) {
                                                router.delete(destroy.url(a.id), { preserveScroll: true });
                                            }
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                {(announcements.prev_page_url || announcements.next_page_url) && (
                    <div className="flex items-center justify-end gap-2 px-1">
                        {announcements.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href={announcements.prev_page_url} preserveScroll>
                                    Newer
                                </Link>
                            </Button>
                        )}
                        {announcements.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href={announcements.next_page_url} preserveScroll>
                                    Older
                                </Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Announcements', href: index() }],
};