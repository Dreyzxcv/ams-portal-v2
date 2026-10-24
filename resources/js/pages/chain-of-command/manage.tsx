import { Form, Head } from '@inertiajs/react';
import { Network, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ChainOfCommandController from '@/actions/App/Http/Controllers/ChainOfCommand/ChainOfCommandController';
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
import { Label } from '@/components/ui/label';
import { index as chainManage } from '@/routes/chain';
import type { ChainEntry } from '@/types/chain';

function EntryDialog({ entry }: { entry?: ChainEntry }) {
    const [open, setOpen] = useState(false);
    const form = entry
        ? ChainOfCommandController.update.form(entry.id)
        : ChainOfCommandController.store.form();

    return (
        <>
            <Button
                type="button"
                size="sm"
                variant={entry ? 'outline' : 'default'}
                className="rounded-xl"
                onClick={() => setOpen(true)}
            >
                {entry ? <Pencil /> : <Plus />}
                {entry ? 'Edit' : 'Add entry'}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-lg">
                    <DialogHeader className="text-left">
                        <DialogTitle>{entry ? 'Edit entry' : 'New entry'}</DialogTitle>
                        <DialogDescription>
                            Shown on the public Chain of Command page.
                        </DialogDescription>
                    </DialogHeader>

                    <Form
                        {...form}
                        options={{ preserveScroll: true }}
                        onSuccess={() => setOpen(false)}
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                {(
                                    [
                                        ['name', 'Name', entry?.name],
                                        ['rank', 'Rank', entry?.rank],
                                        ['position', 'Position', entry?.position],
                                    ] as const
                                ).map(([field, label, value]) => (
                                    <div key={field} className="grid gap-2">
                                        <Label htmlFor={`${field}-${entry?.id ?? 'new'}`}>{label}</Label>
                                        <Input
                                            id={`${field}-${entry?.id ?? 'new'}`}
                                            name={field}
                                            defaultValue={value ?? ''}
                                            required
                                            maxLength={150}
                                            className="rounded-xl"
                                        />
                                        <InputError message={errors[field]} />
                                    </div>
                                ))}

                                <div className="grid gap-2">
                                    <Label htmlFor={`note-${entry?.id ?? 'new'}`}>Note (optional)</Label>
                                    <textarea
                                        id={`note-${entry?.id ?? 'new'}`}
                                        name="note"
                                        rows={3}
                                        maxLength={1000}
                                        defaultValue={entry?.note ?? ''}
                                        className="border-input bg-background focus-visible:ring-ring/50 w-full rounded-xl border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                    />
                                    <InputError message={errors.note} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`sort-${entry?.id ?? 'new'}`}>Display order</Label>
                                    <Input
                                        id={`sort-${entry?.id ?? 'new'}`}
                                        name="sort_order"
                                        type="number"
                                        min={0}
                                        max={65535}
                                        defaultValue={entry?.sort_order ?? 0}
                                        className="rounded-xl"
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        Lower numbers appear first.
                                    </p>
                                    <InputError message={errors.sort_order} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`image-${entry?.id ?? 'new'}`}>Photo link (optional)</Label>
                                    <Input
                                        id={`image-${entry?.id ?? 'new'}`}
                                        name="image_url"
                                        type="url"
                                        inputMode="url"
                                        placeholder="https://www.image2url.com/r2/default/images/example.png"
                                        defaultValue={entry?.image_url ?? ''}
                                        maxLength={500}
                                        className="rounded-xl"
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        Direct image link only (ends in .jpg, .png or .webp). Page links will not
                                        work. Leave blank for no photo.
                                    </p>
                                    <InputError message={errors.image_url} />
                                </div>

                                <div className="flex justify-end gap-2 pt-1">
                                    <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing} className="rounded-xl">
                                        {processing ? 'Saving…' : 'Save'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function ChainManage({ entries }: { entries: ChainEntry[] }) {
    return (
        <>
            <Head title="Chain of Command" />

            <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div className="flex items-center gap-4">
                        <span
                            aria-hidden="true"
                            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400"
                        >
                            <Network className="size-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Chain of Command</h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Changes appear immediately on the{' '}
                                <a href="/chain-of-command" className="underline" target="_blank" rel="noreferrer">
                                    public page
                                </a>
                            </p>
                        </div>
                    </div>
                    <EntryDialog />
                </div>

                <div className="bg-card overflow-hidden rounded-2xl border shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/60 text-muted-foreground text-left text-xs">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Order</th>
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Rank</th>
                                    <th className="px-4 py-3 font-medium">Position</th>
                                    <th className="px-5 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {entries.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-muted-foreground px-5 py-12 text-center">
                                            No entries yet.
                                        </td>
                                    </tr>
                                )}
                                {entries.map((e) => (
                                    <tr key={e.id} className="hover:bg-muted/40 border-t align-middle">
                                        <td className="px-5 py-3 tabular-nums">{e.sort_order}</td>
                                        <td className="px-4 py-3 font-medium">{e.name}</td>
                                        <td className="text-muted-foreground px-4 py-3">{e.rank}</td>
                                        <td className="px-4 py-3">{e.position}</td>
                                        <td className="px-5 py-3">
                                            <div className="flex justify-end gap-2">
                                                <EntryDialog entry={e} />
                                                <Form
                                                    {...ChainOfCommandController.destroy.form(e.id)}
                                                    options={{ preserveScroll: true }}
                                                    onBefore={() => window.confirm(`Remove ${e.name}?`)}
                                                >
                                                    {({ processing }) => (
                                                        <Button
                                                            type="submit"
                                                            variant="destructive"
                                                            size="sm"
                                                            disabled={processing}
                                                            className="rounded-xl"
                                                        >
                                                            <Trash2 />
                                                            Remove
                                                        </Button>
                                                    )}
                                                </Form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

ChainManage.layout = {
    breadcrumbs: [{ title: 'Chain of Command', href: chainManage() }],
};