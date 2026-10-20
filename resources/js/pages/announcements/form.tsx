import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store, update } from '@/routes/announcements';
import type { ManagedAnnouncement } from '@/types/announcement';

type Field = 'recipient' | 'sender' | 'subject' | 'signature';

const fields: { name: Field; label: string; placeholder: string }[] = [
    { name: 'recipient', label: 'To', placeholder: 'All Medical Trainees, Batch 10' },
    { name: 'sender', label: 'From', placeholder: 'Office of the Dean of Medicine' },
    { name: 'subject', label: 'RE:', placeholder: 'Phase 3 evaluation schedule' },
];

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
            className="max-w-2xl space-y-5"
        >
            {fields.map((f) => (
                <div key={f.name} className="grid gap-2">
                    <Label htmlFor={f.name}>{f.label}</Label>
                    <Input
                        id={f.name}
                        value={form.data[f.name]}
                        maxLength={150}
                        placeholder={f.placeholder}
                        onChange={(e) => form.setData(f.name, e.target.value)}
                    />
                    {form.errors[f.name] && <p className="text-destructive text-sm">{form.errors[f.name]}</p>}
                </div>
            ))}

            <div className="grid gap-2">
                <Label htmlFor="body">Context</Label>
                <textarea
                    id="body"
                    rows={10}
                    maxLength={3000}
                    value={form.data.body}
                    onChange={(e) => form.setData('body', e.target.value)}
                    className="border-input bg-background focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                />
                <p className="text-muted-foreground text-xs">{form.data.body.length}/3000</p>
                {form.errors.body && <p className="text-destructive text-sm">{form.errors.body}</p>}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="signature">Name / signature</Label>
                <Input
                    id="signature"
                    value={form.data.signature}
                    maxLength={150}
                    placeholder="COL Dela Cruz, Dean of Medicine"
                    onChange={(e) => form.setData('signature', e.target.value)}
                />
                {form.errors.signature && <p className="text-destructive text-sm">{form.errors.signature}</p>}
            </div>

            {announcement?.is_published && announcement.discord_status === 'sent' && (
                <p className="text-muted-foreground text-xs">
                    Edits update the portal only; the message already posted in Discord is not changed.
                </p>
            )}

            <div className="flex flex-wrap gap-3">
                <Button type="submit" variant="outline" disabled={form.processing}>
                    {announcement ? 'Save changes' : 'Save as draft'}
                </Button>
                {showPublish && (
                    <Button type="button" disabled={form.processing} onClick={() => submit(true)}>
                        {announcement ? 'Save & publish' : 'Publish now'}
                    </Button>
                )}
            </div>
        </form>
    );
}