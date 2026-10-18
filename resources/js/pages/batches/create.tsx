import { Form, Head, Link } from '@inertiajs/react';
import BatchController from '@/actions/App/Http/Controllers/Batches/BatchController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BatchesCreate() {
    return (
        <>
            <Head title="New batch" />

            <div className="max-w-xl space-y-6 p-4">
                <Heading title="New batch" description="Create a batch, then assign trainees to it" />

                <Form {...BatchController.store.form()} className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Batch name</Label>
                                <Input id="name" name="name" required autoFocus autoComplete="off" maxLength={100} />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="starts_on">Start date (optional)</Label>
                                <Input id="starts_on" name="starts_on" type="date" />
                                <InputError message={errors.starts_on} />
                            </div>

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Create batch
                                </Button>
                                <Button asChild variant="ghost">
                                    <Link href={BatchController.index()}>Cancel</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
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