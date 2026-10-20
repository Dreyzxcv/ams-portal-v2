import { Head } from '@inertiajs/react';
import { index } from '@/routes/announcements';
import type { ManagedAnnouncement } from '@/types/announcement';
import AnnouncementForm from './form';

export default function Edit({ announcement }: { announcement: ManagedAnnouncement }) {
    return (
        <>
            <Head title="Edit announcement" />
            <div className="p-4 sm:p-6">
                <h1 className="mb-6 text-xl font-semibold">Edit announcement</h1>
                <AnnouncementForm announcement={announcement} />
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Announcements', href: index() },
        { title: 'Edit', href: index() },
    ],
};