import { Form, Head, Link } from '@inertiajs/react';
import { Layers } from 'lucide-react';
import BatchController from '@/actions/App/Http/Controllers/Batches/BatchController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BatchesCreate() {
    return (
        <>
            <Head title="New batch" />

            <div className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:p-6">
                <div className="flex items-center gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <span
                        aria-hidden="true"
                        className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-600 dark:text-violet-400"
                    >
                        <Layers className="size-6" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            New batch
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Create a batch, then assign trainees to it
                        </p>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border p-6 shadow-xs">
                    <Form {...BatchController.store.form()} className="space-y-5">
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Batch name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        autoFocus
                                        autoComplete="off"
                                        maxLength={100}
                                        className="rounded-xl"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="starts_on">Start date (optional)</Label>
                                    <Input
                                        id="starts_on"
                                        name="starts_on"
                                        type="date"
                                        className="rounded-xl"
                                    />
                                    <InputError message={errors.starts_on} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="ends_on">End date (optional)</Label>
                                    <Input
                                        id="ends_on"
                                        name="ends_on"
                                        type="date"
                                        className="rounded-xl"
                                    />
                                    <InputError message={errors.ends_on} />
                                </div>

                                <div className="flex items-center gap-3 pt-1">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-xl"
                                    >
                                        Create batch
                                    </Button>
                                    <Button asChild variant="ghost" className="rounded-xl">
                                        <Link href={BatchController.index()}>Cancel</Link>
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

BatchesCreate.layout = {
    breadcrumbs: [
        { title: 'Batches', href: BatchController.index() },
        { title: 'New batch', href: BatchController.create() },
    ],
};