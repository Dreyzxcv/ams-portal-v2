import { Form, Head, Link } from '@inertiajs/react';
import ViolationController from '@/actions/App/Http/Controllers/Violations/ViolationController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TraineeOption } from '@/types/violations';

type Props = { trainees: TraineeOption[] };

const fieldClass =
    'border-input bg-background w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function ViolationsCreate({ trainees }: Props) {
    const today = new Date().toISOString().slice(0, 10);

    return (
        <>
            <Head title="New violation" />

            <div className="max-w-xl space-y-6 p-4">
                <Heading
                    title="New violation"
                    description="You will be recorded as the person who issued it"
                />

                <Form {...ViolationController.store.form()} className="space-y-6">
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

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Save violation
                                </Button>
                                <Button asChild variant="ghost">
                                    <Link href={ViolationController.index()}>Cancel</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
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