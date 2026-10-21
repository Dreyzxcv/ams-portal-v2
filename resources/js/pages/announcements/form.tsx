import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store, update } from '@/routes/announcements';
import type { ManagedAnnouncement } from '@/types/announcement';

type Field = 'recipient' | 'sender' | 'subject' | 'signature';

const fields: { name: Field; label: string; placeholder: string }[] = [
    { name: 'recipient', label: 'To', placeholder: 'All Medical Trainees' },
    { name: 'sender', label: 'From', placeholder: 'Office of the Dean of Medicine' },
    { name: 'subject', label: 'RE:', placeholder: 'Subject' },
];

const card = 'bg-card rounded-2xl border shadow-xs';

export default function AnnouncementForm({ announcement }: { announcement?: ManagedAnnouncement }) {
    const form = useForm({
        recipient: announcement?.recipient ?? '',
        sender: announcement?.sender ?? '',
        subject: announcement?.subject ?? '',
        body: announcement?.body ?? '',
        signature: announcement?.signature ?? '',
        publish: false,
    });

    const submit = (publish: boolean) => {
        form.transform((data) => ({ ...data, publish }));

        if (announcement) {
            form.put(update.url(announcement.id), { preserveScroll: true });
        } else {
            form.post(store.url(), { preserveScroll: true });
        }
    };

    const showPublish = !announcement?.is_published;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                submit(false);
            }}
            className="space-y-4"
        >
            <section className={card}>
                <header className="border-b px-5 py-4">
                    <h2 className="text-sm font-semibold">Memo header</h2>
                    <p className="text-muted-foreground text-xs">Shown as TO, FROM and RE on the public page.</p>
                </header>
                <div className="space-y-5 p-5">
                    {fields.map((f) => (
                        <div key={f.name} className="grid gap-2">
                            <Label htmlFor={f.name}>{f.label}</Label>
                            <Input
                                id={f.name}
                                value={form.data[f.name]}
                                maxLength={150}
                                placeholder={f.placeholder}
                                onChange={(e) => form.setData(f.name, e.target.value)}
                                className="rounded-xl"
                            />
                            {form.errors[f.name] && (
                                <p className="text-sm text-red-600 dark:text-red-400">{form.errors[f.name]}</p>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <section className={card}>
                <header className="border-b px-5 py-4">
                    <h2 className="text-sm font-semibold">Message</h2>
                </header>
                <div className="space-y-5 p-5">
                    <div className="grid gap-2">
                        <Label htmlFor="body">Context</Label>
                        <textarea
                            id="body"
                            rows={10}
                            maxLength={3000}
                            value={form.data.body}
                            onChange={(e) => form.setData('body', e.target.value)}
                            className="border-input bg-background focus-visible:ring-ring/50 w-full rounded-xl border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                        />
                        <p className="text-muted-foreground text-right text-xs tabular-nums">
                            {form.data.body.length}/3000
                        </p>
                        {form.errors.body && (
                            <p className="text-sm text-red-600 dark:text-red-400">{form.errors.body}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="signature">Name / signature</Label>
                        <Input
                            id="signature"
                            value={form.data.signature}
                            maxLength={150}
                            placeholder="[RANK] [USERNAME], [POSITION]"
                            onChange={(e) => form.setData('signature', e.target.value)}
                            className="rounded-xl"
                        />
                        {form.errors.signature && (
                            <p className="text-sm text-red-600 dark:text-red-400">{form.errors.signature}</p>
                        )}
                    </div>
                </div>
            </section>

            {announcement?.is_published && announcement.discord_status === 'sent' && (
                <p className="rounded-2xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
                    Edits update the portal only; the message already posted in Discord is not changed.
                </p>
            )}

            <div className="flex flex-wrap gap-3">
                <Button type="submit" variant="outline" disabled={form.processing} className="rounded-xl">
                    {announcement ? 'Save changes' : 'Save as draft'}
                </Button>
                {showPublish && (
                    <Button type="button" disabled={form.processing} onClick={() => submit(true)} className="rounded-xl">
                        {announcement ? 'Save & publish' : 'Publish now'}
                    </Button>
                )}
            </div>
        </form>
    );
}