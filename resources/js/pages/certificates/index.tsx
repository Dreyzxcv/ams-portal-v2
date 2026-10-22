import { Form, Head, Link, router } from '@inertiajs/react';
import { Award, ExternalLink, FileText, Search, Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import CertificateController from '@/actions/App/Http/Controllers/Certificates/CertificateController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { CertificateRow } from '@/types/certificates';
import type { Paginated } from '@/types/users';

type Props = {
    trainees: Paginated<CertificateRow>;
    filters: { search: string };
};

const pill = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium';
const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp';

const statusStyle = {
    issued: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    revoked: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
    pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    none: 'bg-muted text-muted-foreground',
} as const;

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('');
}

function FilePreview({
    src,
    mime,
    title,
}: {
    src: string;
    mime: string | null;
    title: string;
}) {
    const isImage = mime?.startsWith('image/') ?? false;

    return (
        <div className="space-y-2">
            {isImage ? (
                <div className="bg-muted flex max-h-[60dvh] w-full items-center justify-center overflow-hidden rounded-xl border">
                    <img
                        src={src}
                        alt={title}
                        className="max-h-[60dvh] w-full object-contain"
                    />
                </div>
            ) : (
                <>
                    <iframe
                        src={src}
                        title={title}
                        className="bg-muted hidden h-[55dvh] w-full rounded-xl border sm:block"
                    />
                    <div className="bg-muted/60 flex flex-col items-center gap-3 rounded-xl border px-4 py-8 text-center sm:hidden">
                        <FileText className="text-muted-foreground size-8" aria-hidden="true" />
                        <p className="text-muted-foreground text-sm">
                            PDF previews are not supported inside this view on mobile.
                        </p>
                        <Button asChild size="sm" className="w-full rounded-xl">
                            <a href={src} target="_blank" rel="noreferrer">
                                <ExternalLink />
                                Open PDF
                            </a>
                        </Button>
                    </div>
                </>
            )}
            <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground hidden items-center gap-1 text-xs sm:inline-flex"
            >
                <ExternalLink className="size-3" aria-hidden="true" />
                Preview not showing? Open in a new tab
            </a>
        </div>
    );
}

function ManageDialog({ trainee }: { trainee: CertificateRow }) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [localUrl, setLocalUrl] = useState<string | null>(null);

    const c = trainee.certificate;
    const issued = c?.status === 'issued';

    // Blob URL for previewing the chosen file before it is uploaded.
    useEffect(() => {
        if (!file) {
            setLocalUrl(null);

            return;
        }

        const url = URL.createObjectURL(file);
        setLocalUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [file]);

    function onOpenChange(next: boolean) {
        setOpen(next);

        if (!next) {
            setFile(null);
        }
    }

    function close() {
        setOpen(false);
        setFile(null);
    }

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => setOpen(true)}
            >
                <Settings2 />
                Manage
            </Button>

            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] gap-3 overflow-y-auto rounded-2xl p-4 sm:max-w-3xl sm:gap-4 sm:p-6">
                    <DialogHeader className="text-left">
                        <DialogTitle className="pr-6">Manage certificate</DialogTitle>
                        <DialogDescription className="break-words">
                            {trainee.name} (@{trainee.username})
                            {c?.number ? ` · ${c.number}` : ''}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={cn(
                                pill,
                                statusStyle[c ? c.status : 'none'],
                                'capitalize',
                            )}
                        >
                            {c ? c.status : 'Not issued'}
                        </span>
                        {c?.issued_at && (
                            <span className="text-muted-foreground text-xs">
                                Issued {new Date(c.issued_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>

                    {/* Current file on record */}
                    {c?.has_file && (
                        <section className="space-y-2">
                            <h3 className="flex items-center gap-2 text-sm font-semibold">
                                <FileText className="size-4" aria-hidden="true" />
                                {issued ? 'Issued certificate' : 'Previous file (revoked)'}
                            </h3>
                            <FilePreview
                                src={CertificateController.preview.url(c.id)}
                                mime={c.mime}
                                title={`Certificate ${c.number ?? ''}`}
                            />
                            <Button asChild variant="outline" size="sm" className="w-full rounded-xl sm:w-auto">
                                <a href={CertificateController.download.url(c.id)}>Download</a>
                            </Button>
                        </section>
                    )}

                    {/* Issue / re-issue */}
                    {!issued && (
                        <section className="space-y-3 border-t pt-4">
                            <h3 className="text-sm font-semibold">
                                {c?.status === 'revoked' ? 'Re-issue certificate' : 'Issue certificate'}
                            </h3>

                            <Form
                                {...CertificateController.store.form(trainee.id)}
                                options={{ preserveScroll: true }}
                                onSuccess={close}
                                className="space-y-3"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="space-y-1">
                                            <Input
                                                type="file"
                                                name="file"
                                                accept={ACCEPT}
                                                required
                                                aria-label={`Certificate file for ${trainee.name}`}
                                                className="rounded-xl text-xs"
                                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                            />
                                            <p className="text-muted-foreground text-xs">
                                                PDF, JPG, PNG or WebP, up to 5 MB.
                                            </p>
                                        </div>
                                        <InputError message={errors.file} />

                                        {localUrl && file && (
                                            <div className="space-y-1">
                                                <p className="text-muted-foreground text-xs break-all">
                                                    Preview of {file.name}. Not issued until you confirm.
                                                </p>
                                                <FilePreview
                                                    src={localUrl}
                                                    mime={file.type}
                                                    title="Selected file preview"
                                                />
                                            </div>
                                        )}

                                        <div className="flex flex-col-reverse gap-2 sm:flex-row">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="rounded-xl"
                                                onClick={close}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing || !file}
                                                className="rounded-xl"
                                            >
                                                {processing
                                                    ? 'Uploading…'
                                                    : c?.status === 'revoked'
                                                      ? 'Re-issue'
                                                      : 'Issue'}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </section>
                    )}

                    {/* Revoke */}
                    {issued && c && (
                        <section className="border-t pt-4">
                            <Form
                                {...CertificateController.revoke.form(c.id)}
                                options={{ preserveScroll: true }}
                                onSuccess={close}
                                onBefore={() =>
                                    window.confirm(
                                        `Revoke ${c.number}? The trainee will lose access to the file.`,
                                    )
                                }
                            >
                                {({ processing }) => (
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        size="sm"
                                        disabled={processing}
                                        className="w-full rounded-xl sm:w-auto"
                                    >
                                        Revoke certificate
                                    </Button>
                                )}
                            </Form>
                        </section>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function CertificatesIndex({ trainees, filters }: Props) {
    const [search, setSearch] = useState(filters.search);

    return (
        <>
            <Head title="Certificates" />

            <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div className="flex items-center gap-4">
                        <span
                            aria-hidden="true"
                            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-600 dark:text-violet-400"
                        >
                            <Award className="size-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Certificates</h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Open Manage to issue, preview or revoke a certificate. Files are private and served through the portal.
                            </p>
                        </div>
                    </div>

                    <form
                        className="flex w-full items-center gap-2 sm:w-auto"
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get(
                                CertificateController.index.url(),
                                search.trim() ? { search: search.trim() } : {},
                                { preserveState: true, replace: true },
                            );
                        }}
                    >
                        <div className="relative min-w-0 flex-1 sm:flex-none">
                            <Search
                                aria-hidden="true"
                                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                            />
                            <Input
                                className="bg-background/70 w-full rounded-xl pl-9 sm:w-64"
                                type="search"
                                placeholder="Search name or username"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                aria-label="Search trainees"
                            />
                        </div>
                        <Button type="submit" className="rounded-xl">
                            Search
                        </Button>
                    </form>
                </div>

                <div className="bg-card overflow-hidden rounded-2xl border shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/60 text-muted-foreground text-left text-xs">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Trainee</th>
                                    <th className="px-4 py-3 font-medium">Certificate</th>
                                    <th className="px-4 py-3 font-medium">Issued</th>
                                    <th className="px-5 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trainees.data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-muted-foreground px-5 py-12 text-center">
                                            No trainees found.
                                        </td>
                                    </tr>
                                )}
                                {trainees.data.map((t) => {
                                    const c = t.certificate;
                                    const key = c ? c.status : 'none';

                                    return (
                                        <tr key={t.id} className="hover:bg-muted/40 border-t align-top transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        aria-hidden="true"
                                                        className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-xs font-semibold text-sky-700 dark:text-sky-300"
                                                    >
                                                        {initials(t.name)}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <div className="truncate font-medium">{t.name}</div>
                                                        <div className="text-muted-foreground text-xs">@{t.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn(pill, statusStyle[key], 'capitalize')}>
                                                    {c ? c.status : 'Not issued'}
                                                </span>
                                                {c?.number && (
                                                    <div className="text-muted-foreground mt-1 text-xs">{c.number}</div>
                                                )}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3">
                                                {c?.issued_at ? new Date(c.issued_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-5 py-3">
                                                <ManageDialog trainee={t} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex items-center justify-between px-1 text-sm">
                    <p className="text-muted-foreground">
                        {trainees.total === 0
                            ? 'No trainees'
                            : `Showing ${trainees.from} to ${trainees.to} of ${trainees.total}`}
                    </p>
                    <div className="flex gap-2">
                        {trainees.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href={trainees.prev_page_url} preserveScroll>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        {trainees.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
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

CertificatesIndex.layout = {
    breadcrumbs: [{ title: 'Certificates', href: CertificateController.index() }],
};