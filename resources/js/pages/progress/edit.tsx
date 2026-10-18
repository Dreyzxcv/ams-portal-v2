import { Form, Head, Link } from '@inertiajs/react';
import ProgressController from '@/actions/App/Http/Controllers/Progress/ProgressController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    trainee: { id: number; name: string; username: string };
    progress: {
        current_phase: number;
        started_on: string | null;
        exists: boolean;
        updated_at: string | null;
        updated_by: string | null;
    };
    remaining_days: number | null;
    days_configured: boolean;
    max_phase: number;
};

const selectClass =
    'border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function ProgressEdit({ trainee, progress, remaining_days, days_configured, max_phase }: Props) {
    const phases = Array.from({ length: max_phase }, (_, i) => i + 1);

    return (
        <>
            <Head title={`Progress: ${trainee.name}`} />

            <div className="max-w-xl space-y-6 p-4">
                <Heading title={trainee.name} description={`Username: ${trainee.username}`} />

                <div className="text-muted-foreground space-y-1 rounded-lg border p-4 text-sm">
                    <div>
                        Estimated days remaining:{' '}
                        <span className="text-foreground font-medium">
                            {remaining_days ?? (days_configured ? 'Set a start date' : 'Not configured')}
                        </span>
                    </div>
                    <div>
                        Last update:{' '}
                        {progress.updated_at
                            ? `${new Date(progress.updated_at).toLocaleString()}${progress.updated_by ? ` by ${progress.updated_by}` : ''}`
                            : 'No progress recorded yet'}
                    </div>
                </div>

                <Form
                    {...ProgressController.update.form(trainee.id)}
                    options={{ preserveScroll: true }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="current_phase">Current phase</Label>
                                <select
                                    id="current_phase"
                                    name="current_phase"
                                    defaultValue={progress.current_phase}
                                    className={selectClass}
                                >
                                    {phases.map((p) => (
                                        <option key={p} value={p}>
                                            Phase {p}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.current_phase} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="started_on">Start date</Label>
                                <Input
                                    id="started_on"
                                    name="started_on"
                                    type="date"
                                    defaultValue={progress.started_on ?? ''}
                                />
                                <InputError message={errors.started_on} />
                            </div>

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Save progress
                                </Button>
                                <Button asChild variant="ghost">
                                    <Link href={ProgressController.index()}>Back to progress</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ProgressEdit.layout = {
    breadcrumbs: [
        { title: 'Progress', href: ProgressController.index() },
        { title: 'Update progress', href: ProgressController.index() },
    ],
};