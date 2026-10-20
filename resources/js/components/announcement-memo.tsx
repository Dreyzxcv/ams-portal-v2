import type { PublicAnnouncement } from '@/types/announcement';

// React escapes all text; never use dangerouslySetInnerHTML here.
export default function AnnouncementMemo({ a }: { a: PublicAnnouncement }) {
    return (
        <article className="bg-card rounded-2xl border p-6 shadow-xs sm:p-8">
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