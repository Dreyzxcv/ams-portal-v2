import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, TriangleAlert } from 'lucide-react';
import ViolationController from '@/actions/App/Http/Controllers/Violations/ViolationController';
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
    'border-input bg-background w-full rounded-xl border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function ViolationsEdit({ violation }: Props) {
    const today = new Date().toISOString().slice(0, 10);

    return (
        <>
            <Head title="Edit violation" />

            <div className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div className="flex min-w-0 items-center gap-4">
                        <span
                            aria-hidden="true"
                            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        >
                            <TriangleAlert className="size-6" />
                        </span>
                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                                Edit violation
                            </h1>
                            <p className="text-muted-foreground truncate text-sm">
                                Trainee: {violation.trainee_name ?? 'Unknown'}. The trainee cannot be changed.
                            </p>
                        </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="bg-background/70 rounded-xl">
                        <Link href={ViolationController.index()}>
                            <ArrowLeft className="size-4" aria-hidden="true" />
                            Back
                        </Link>
                    </Button>
                </div>

                <div className="bg-card rounded-2xl border p-6 shadow-xs">
                    <Form {...ViolationController.update.form(violation.id)} className="space-y-5">
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
                                        defaultValue={violation.description}
                                        className={fieldClass}
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <div className="flex items-center gap-3 pt-1">
                                    <Button type="submit" disabled={processing} className="rounded-xl">
                                        Save changes
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

ViolationsEdit.layout = {
    breadcrumbs: [
        { title: 'Violations', href: ViolationController.index() },
        { title: 'Edit violation', href: ViolationController.index() },
    ],
};