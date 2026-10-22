import { Form, Head, Link, router } from '@inertiajs/react';
import { Award, Search } from 'lucide-react';
import { useState } from 'react';
import CertificateController from '@/actions/App/Http/Controllers/Certificates/CertificateController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { CertificateRow } from '@/types/certificates';
import type { Paginated } from '@/types/users';

type Props = {
    trainees: Paginated<CertificateRow>;
    filters: { search: string };
};

const pill = 'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium';

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
                                Upload a PDF to issue a certificate. Files are private and served through the portal.
                            </p>
                        </div>
                    </div>

                    <form
                        className="flex items-center gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get(
                                CertificateController.index.url(),
                                search.trim() ? { search: search.trim() } : {},
                                { preserveState: true, replace: true },
                            );
                        }}
                    >
                        <div className="relative">
                            <Search
                                aria-hidden="true"
                                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                            />
                            <Input
                                className="bg-background/70 w-64 rounded-xl pl-9"
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
                                    const issued = c?.status === 'issued';

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
                                                <div className="flex flex-wrap items-start gap-2">
                                                    {c && c.has_file && (
                                                        <Button asChild variant="outline" size="sm" className="rounded-xl">
                                                            <a href={CertificateController.download.url(c.id)}>Download</a>
                                                        </Button>
                                                    )}

                                                    {!issued && (
                                                        <Form
                                                            {...CertificateController.store.form(t.id)}
                                                            options={{ preserveScroll: true }}
                                                            resetOnSuccess
                                                            className="flex flex-col gap-1"
                                                        >
                                                            {({ processing, errors }) => (
                                                                <>
                                                                    <div className="flex items-center gap-2">
                                                                        <Input
                                                                            type="file"
                                                                            name="file"
                                                                            accept="application/pdf"
                                                                            required
                                                                            aria-label={`Certificate PDF for ${t.name}`}
                                                                            className="h-8 w-56 rounded-xl text-xs"
                                                                        />
                                                                        <Button
                                                                            type="submit"
                                                                            size="sm"
                                                                            disabled={processing}
                                                                            className="rounded-xl"
                                                                        >
                                                                            {processing
                                                                                ? 'Uploading…'
                                                                                : c?.status === 'revoked'
                                                                                  ? 'Re-issue'
                                                                                  : 'Issue'}
                                                                        </Button>
                                                                    </div>
                                                                    <InputError message={errors.file} />
                                                                </>
                                                            )}
                                                        </Form>
                                                    )}

                                                    {issued && c && (
                                                        <Form
                                                            {...CertificateController.revoke.form(c.id)}
                                                            options={{ preserveScroll: true }}
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
                                                                    className="rounded-xl"
                                                                >
                                                                    Revoke
                                                                </Button>
                                                            )}
                                                        </Form>
                                                    )}
                                                </div>
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