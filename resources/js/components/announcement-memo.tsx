import type { PublicAnnouncement } from '@/types/announcement';
import { Pin } from 'lucide-react';

// React escapes all text; never use dangerouslySetInnerHTML here.
export default function AnnouncementMemo({ a }: { a: PublicAnnouncement }) {
    return (
        <article className="bg-card rounded-2xl border p-6 shadow-xs sm:p-8">
            {a.is_pinned && (
                <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <Pin aria-hidden="true" className="size-3" />
                    Pinned
                </span>
            )}
            <dl className="grid grid-cols-[4rem_1fr] gap-x-4 gap-y-1.5 text-sm">
                <dt className="text-muted-foreground font-semibold tracking-wide">TO:</dt>
                <dd className="font-medium break-words">{a.recipient}</dd>
                <dt className="text-muted-foreground font-semibold tracking-wide">FROM:</dt>
                <dd className="font-medium break-words">{a.sender}</dd>
                <dt className="text-muted-foreground font-semibold tracking-wide">RE:</dt>
                <dd className="font-semibold break-words">{a.subject}</dd>
            </dl>
            <hr className="my-5" />
            <p className="text-sm leading-relaxed break-words whitespace-pre-line">{a.body}</p>
            <p className="mt-6 text-sm font-medium break-words">{a.signature}</p>
            {a.published_label && (
                <p className="text-muted-foreground mt-4 text-xs">{a.published_label}</p>
            )}
        </article>
    );
}