import { Form, Head } from '@inertiajs/react';
import { DoorOpen } from 'lucide-react';
import IntakeController from '@/actions/App/Http/Controllers/Intake/IntakeController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { IntakeBanner, IntakeStatusValue } from '@/types/intake';

type Props = {
    setting: {
        batch_id: number | null;
        status: IntakeStatusValue;
        updated_at: string | null;
        updated_by: string | null;
    };
    batches: { id: number; name: string; label: string }[];
    statuses: { value: IntakeStatusValue; label: string }[];
    banner: IntakeBanner | null;
};

const selectClass =
    'border-input bg-background h-9 w-full rounded-xl border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function IntakeEdit({ setting, batches, statuses, banner }: Props) {
    return (
        <>
            <Head title="Applicant intake" />

            <div className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:p-6">
                <div className="flex items-center gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <span
                        aria-hidden="true"
                        className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-600 dark:text-violet-400"
                    >
                        <DoorOpen className="size-6" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Applicant intake
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Controls the status shown on the public welcome page
                        </p>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border p-6 shadow-xs">
                    <p className="text-muted-foreground mb-1 text-xs">
                        Currently shown on the welcome page
                    </p>
                    <p className="mb-6 text-sm font-medium">
                        {banner?.message ?? 'Nothing yet. Choose a batch and save.'}
                    </p>

                    <Form
                        {...IntakeController.update.form()}
                        options={{ preserveScroll: true }}
                        className="space-y-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="batch_id">Current batch</Label>
                                    <select
                                        id="batch_id"
                                        name="batch_id"
                                        required
                                        defaultValue={setting.batch_id ?? ''}
                                        className={selectClass}
                                    >
                                        <option value="" disabled>
                                            Select a batch
                                        </option>
                                        {batches.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.batch_id} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">Intake status</Label>
                                    <select
                                        id="status"
                                        name="status"
                                        required
                                        defaultValue={setting.status}
                                        className={selectClass}
                                    >
                                        {statuses.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.status} />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button type="submit" disabled={processing} className="rounded-xl">
                                        Save
                                    </Button>
                                    {setting.updated_at && (
                                        <span className="text-muted-foreground text-xs">
                                            Last saved{' '}
                                            {new Date(setting.updated_at).toLocaleString()}
                                            {setting.updated_by ? ` by ${setting.updated_by}` : ''}
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

IntakeEdit.layout = {
    breadcrumbs: [{ title: 'Applicant intake', href: IntakeController.edit() }],
};