// resources/js/components/announcement-pin-toggle.tsx
import { router } from '@inertiajs/react';
import { Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pin, unpin } from '@/routes/announcements';

export default function AnnouncementPinToggle({
    id,
    isPinned,
}: {
    id: number;
    isPinned: boolean;
}) {
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() =>
                router.post((isPinned ? unpin : pin).url(id), {}, { preserveScroll: true })
            }
        >
            {isPinned ? <PinOff /> : <Pin />}
            {isPinned ? 'Unpin' : 'Pin'}
        </Button>
    );
}