import { Head } from '@inertiajs/react';
import { create, index } from '@/routes/announcements';
import AnnouncementForm from './form';

export default function Create() {
    return (
        <>
            <Head title="New announcement" />
            <div className="p-4 sm:p-6">
                <h1 className="mb-6 text-xl font-semibold">New announcement</h1>
                <AnnouncementForm />
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Announcements', href: index() },
        { title: 'New', href: create() },
    ],
};