<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;

class GradesChanged implements ShouldBroadcastNow, ShouldDispatchAfterCommit
{
    public function __construct(public int $traineeId) {}

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('staff'),
            new PrivateChannel('users.'.$this->traineeId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'grades.changed';
    }

    /**
     * @return array<string, never>
     */
    public function broadcastWith(): array
    {
        return [];
    }
}
