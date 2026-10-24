import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';
import type { ChainEntry } from '@/types/chain';

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('');
}

export default function ChainOfCommand({ entries }: { entries: ChainEntry[] }) {
    return (
        <>
            <Head title="Chain of Command" />
            <div className="bg-background text-foreground min-h-screen">
                <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6">
                    <div className="space-y-4">
                        <Button asChild variant="ghost" size="sm" className="-ml-2 rounded-xl">
                            <Link href={home()}>
                                <ArrowLeft />
                                Back to home
                            </Link>
                        </Button>
                        <div className="flex items-start gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                                <Network aria-hidden="true" className="size-5" />
                            </span>
                            <div className="space-y-1">
                                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Chain of Command
                                </h1>
                                <p className="text-muted-foreground text-sm">
                                    Leadership of the Army Medical School.
                                </p>
                            </div>
                        </div>
                    </div>

                    {entries.length === 0 ? (
                        <p className="text-muted-foreground rounded-2xl border border-dashed px-6 py-12 text-center text-sm">
                            The chain of command has not been published yet.
                        </p>
                    ) : (
                        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {entries.map((e) => (
                                <li
                                    key={e.id}
                                    className="bg-card flex flex-col items-center gap-3 rounded-2xl border p-6 text-center shadow-xs"
                                >
                                    {e.image_url ? (
                                        <img
                                            src={e.image_url}
                                            alt={`${e.rank} ${e.name}`}
                                            referrerPolicy="no-referrer"
                                            loading="lazy"
                                            className="size-24 rounded-2xl object-cover"
                                        />
                                    ) : (
                                        <span
                                            aria-hidden="true"
                                            className="flex size-24 items-center justify-center rounded-2xl bg-sky-500/10 text-2xl font-semibold text-sky-700 dark:text-sky-300"
                                        >
                                            {initials(e.name)}
                                        </span>
                                    )}
                                    <div className="space-y-0.5">
                                        <p className="text-muted-foreground text-xs font-semibold tracking-wide">
                                            {e.rank}
                                        </p>
                                        <h2 className="font-semibold break-words">{e.name}</h2>
                                        <p className="text-sm break-words">{e.position}</p>
                                    </div>
                                    {e.note && (
                                        <p className="text-muted-foreground text-xs leading-relaxed break-words whitespace-pre-line">
                                            {e.note}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ol>
                    )}
                </main>
            </div>
        </>
    );
}