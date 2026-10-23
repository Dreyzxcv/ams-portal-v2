<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;

class AnnouncementsChanged implements ShouldBroadcastNow, ShouldDispatchAfterCommit
{
    public function __construct(public bool $notifyPublic = false) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [new PrivateChannel('staff')];

        if ($this->notifyPublic) {
            $channels[] = new Channel('announcements');
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'announcements.changed';
    }

    /**
     * @return array<string, never>
     */
    public function broadcastWith(): array
    {
        return [];
    }
}
