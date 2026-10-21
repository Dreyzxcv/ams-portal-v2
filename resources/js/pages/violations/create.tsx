import { Form, Head, Link } from '@inertiajs/react';
import { TriangleAlert } from 'lucide-react';
import ViolationController from '@/actions/App/Http/Controllers/Violations/ViolationController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TraineeOption } from '@/types/violations';

type Props = { trainees: TraineeOption[] };

const fieldClass =
    'border-input bg-background w-full rounded-xl border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function ViolationsCreate({ trainees }: Props) {
    const today = new Date().toISOString().slice(0, 10);

    return (
        <>
            <Head title="New violation" />

            <div className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:p-6">
                <div className="flex items-center gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <span
                        aria-hidden="true"
                        className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    >
                        <TriangleAlert className="size-6" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">New violation</h1>
                        <p className="text-muted-foreground text-sm">You will be recorded as the person who issued it</p>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border p-6 shadow-xs">
                    <Form {...ViolationController.store.form()} className="space-y-5">
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="trainee_id">Trainee</Label>
                                    <select
                                        id="trainee_id"
                                        name="trainee_id"
                                        required
                                        defaultValue=""
                                        className={`${fieldClass} h-9`}
                                    >
                                        <option value="" disabled>
                                            Select a trainee
                                        </option>
                                        {trainees.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} ({t.username})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.trainee_id} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="occurred_on">Date of violation</Label>
                                    <Input
                                        id="occurred_on"
                                        name="occurred_on"
                                        type="date"
                                        max={today}
                                        defaultValue={today}
                                        required
                                        className="rounded-xl"
                                    />
                                    <InputError message={errors.occurred_on} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={5}
                                        maxLength={2000}
                                        required
                                        className={`${fieldClass} py-2`}
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <div className="flex items-center gap-3 pt-1">
                                    <Button type="submit" disabled={processing} className="rounded-xl">
                                        Save violation
                                    </Button>
                                    <Button asChild variant="ghost" className="rounded-xl">
                                        <Link href={ViolationController.index()}>Cancel</Link>
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

ViolationsCreate.layout = {
    breadcrumbs: [
        { title: 'Violations', href: ViolationController.index() },
        { title: 'New violation', href: ViolationController.create() },
    ],
};