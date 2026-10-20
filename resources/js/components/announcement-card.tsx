import { Pin } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { PublicAnnouncement } from '@/types/announcement';

// React escapes all text; never use dangerouslySetInnerHTML here.
function PinnedBadge({ className }: { className?: string }) {
    return (
        <span
            className={
                'inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400 ' +
                (className ?? '')
            }
        >
            <Pin aria-hidden="true" className="size-3" />
            Pinned
        </span>
    );
}

export default function AnnouncementCard({ a }: { a: PublicAnnouncement }) {
    return (
        <Dialog>
            <article className="bg-card hover:border-foreground/20 relative flex h-full flex-col rounded-2xl border p-5 shadow-xs transition hover:shadow-md">
                {/* Stretched trigger: whole card is clickable, markup stays valid */}
                <DialogTrigger asChild>
                    <button
                        type="button"
                        className="focus-visible:ring-ring absolute inset-0 z-10 cursor-pointer rounded-2xl focus-visible:ring-2 focus-visible:outline-none"
                    >
                        <span className="sr-only">Read announcement: {a.subject}</span>
                    </button>
                </DialogTrigger>

                <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span>{a.published_label}</span>
                    {a.is_pinned && <PinnedBadge />}
                </div>

                <h3 className="mt-3 text-base leading-snug font-semibold tracking-tight break-words">
                    <span className="text-muted-foreground mr-1.5 text-xs font-semibold tracking-wide">
                        RE:
                    </span>
                    {a.subject}
                </h3>

                <dl className="mt-3 grid grid-cols-[3rem_1fr] gap-x-3 gap-y-1 text-xs">
                    <dt className="text-muted-foreground font-semibold tracking-wide">TO:</dt>
                    <dd className="truncate font-medium">{a.recipient}</dd>
                    <dt className="text-muted-foreground font-semibold tracking-wide">FROM:</dt>
                    <dd className="truncate font-medium">{a.sender}</dd>
                </dl>

                <hr className="my-3" />

                <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed break-words whitespace-pre-line">
                    {a.body}
                </p>
            </article>

            <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl sm:max-w-xl">
                <DialogHeader className="space-y-3 text-left">
                    {a.is_pinned && <PinnedBadge className="w-fit" />}
                    <DialogTitle className="pr-6 text-lg leading-snug font-semibold break-words">
                        <span className="text-muted-foreground mr-1.5 text-xs font-semibold tracking-wide">
                            RE:
                        </span>
                        {a.subject}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Full announcement from {a.sender} to {a.recipient}.
                    </DialogDescription>
                </DialogHeader>

                <dl className="grid grid-cols-[4rem_1fr] gap-x-4 gap-y-1.5 text-sm">
                    <dt className="text-muted-foreground font-semibold tracking-wide">TO:</dt>
                    <dd className="font-medium break-words">{a.recipient}</dd>
                    <dt className="text-muted-foreground font-semibold tracking-wide">FROM:</dt>
                    <dd className="font-medium break-words">{a.sender}</dd>
                </dl>

                <hr />

                <p className="text-sm leading-relaxed break-words whitespace-pre-line">{a.body}</p>

                <p className="text-sm font-medium break-words">{a.signature}</p>

                {a.published_label && (
                    <p className="text-muted-foreground text-xs">{a.published_label}</p>
                )}
            </DialogContent>
        </Dialog>
    );
}