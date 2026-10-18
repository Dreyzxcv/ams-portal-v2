import { Form, Head, Link } from '@inertiajs/react';
import ViolationController from '@/actions/App/Http/Controllers/Violations/ViolationController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    violation: {
        id: number;
        trainee_name: string | null;
        occurred_on: string | null;
        description: string;
    };
};

const fieldClass =
    'border-input bg-background w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function ViolationsEdit({ violation }: Props) {
    const today = new Date().toISOString().slice(0, 10);

    return (
        <>
            <Head title="Edit violation" />

            <div className="max-w-xl space-y-6 p-4">
                <Heading
                    title="Edit violation"
                    description={`Trainee: ${violation.trainee_name ?? 'Unknown'}. The trainee cannot be changed.`}
                />

                <Form
                    {...ViolationController.update.form(violation.id)}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="occurred_on">Date of violation</Label>
                                <Input
                                    id="occurred_on"
                                    name="occurred_on"
                                    type="date"
                                    max={today}
                                    defaultValue={violation.occurred_on ?? ''}
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
                                    defaultValue={violation.description}
                                    className={fieldClass}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Save changes
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

ViolationsEdit.layout = {
    breadcrumbs: [
        { title: 'Violations', href: ViolationController.index() },
        { title: 'Edit violation', href: ViolationController.index() },
    ],
};