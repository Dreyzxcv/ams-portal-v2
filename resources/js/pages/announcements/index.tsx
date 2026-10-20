import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { create, destroy, edit, index, publish, retry, unpublish } from '@/routes/announcements';
import type { DiscordStatus, ManagedAnnouncement } from '@/types/announcement';

type Paginated = {
    data: ManagedAnnouncement[];
    next_page_url: string | null;
    prev_page_url: string | null;
};

const discordLabel: Record<DiscordStatus, { text: string; cls: string }> = {
    not_sent: { text: 'Discord: not sent', cls: 'bg-muted text-muted-foreground' },
    sending: { text: 'Discord: sending…', cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    sent: { text: 'Discord: sent', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    failed: { text: 'Discord: failed', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
};

const post = (url: string) => router.post(url, {}, { preserveScroll: true });

export default function Index({ announcements }: { announcements: Paginated }) {
    // Shown only if your app shares flash under `status`; the per-row badges below are the source of truth.
    const status = (usePage().props as { status?: string }).status;

    return (
        <>
            <Head title="Announcements" />
            <div className="space-y-6 p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold">Announcements</h1>
                    <Button asChild>
                        <Link href={create.url()}>New announcement</Link>
                    </Button>
                </div>

                {status && <p className="rounded-xl border bg-sky-500/10 px-4 py-3 text-sm">{status}</p>}

                {announcements.data.length === 0 && (
                    <p className="text-muted-foreground text-sm">No announcements yet.</p>
                )}

                <ul className="space-y-3">
                    {announcements.data.map((a) => {
                        const d = discordLabel[a.discord_status];

                        return (
                            <li key={a.id} className="bg-card space-y-3 rounded-2xl border p-4">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-semibold break-words">RE: {a.subject}</p>
                                        <p className="text-muted-foreground text-xs break-words">
                                            To: {a.recipient} · From: {a.sender}
                                            {a.author ? ` · by ${a.author}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs font-medium">
                                        <span
                                            className={`rounded-full px-2.5 py-1 ${
                                                a.is_published
                                                    ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {a.is_published ? `Published ${a.published_label}` : 'Draft'}
                                        </span>
                                        {a.is_published && (
                                            <span className={`rounded-full px-2.5 py-1 ${d.cls}`}>{d.text}</span>
                                        )}
                                    </div>
                                </div>

                                {a.is_published && a.discord_status === 'failed' && (
                                    <p className="rounded-xl border border-rose-500/40 bg-rose-500/5 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
                                        {a.discord_error ?? 'Discord delivery failed.'} The announcement is live in the
                                        portal; retry to post it to Discord.
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={edit.url(a.id)}>Edit</Link>
                                    </Button>
                                    {!a.is_published && (
                                        <Button size="sm" onClick={() => post(publish.url(a.id))}>
                                            Publish
                                        </Button>
                                    )}
                                    {a.is_published && (
                                        <Button size="sm" variant="outline" onClick={() => post(unpublish.url(a.id))}>
                                            Unpublish
                                        </Button>
                                    )}
                                    {a.is_published && (a.discord_status === 'failed' || a.discord_status === 'sending') && (
                                        <Button size="sm" onClick={() => post(retry.url(a.id))}>
                                            Retry Discord
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="destructive"
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

                <div className="flex gap-3">
                    {announcements.prev_page_url && (
                        <Button asChild variant="outline" size="sm">
                            <Link href={announcements.prev_page_url}>Newer</Link>
                        </Button>
                    )}
                    {announcements.next_page_url && (
                        <Button asChild variant="outline" size="sm">
                            <Link href={announcements.next_page_url}>Older</Link>
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Announcements', href: index() }],
};