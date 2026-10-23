<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;

class QuizzesChanged implements ShouldBroadcastNow, ShouldDispatchAfterCommit
{
    public function __construct(
        public ?int $traineeId = null,
        public bool $notifyActiveUsers = false,
    ) {}

    /**
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        $channels = [new PrivateChannel('staff')];

        if ($this->notifyActiveUsers) {
            $channels[] = new PrivateChannel('active-users');
        }

        if ($this->traineeId !== null) {
            $channels[] = new PrivateChannel('users.'.$this->traineeId);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'quizzes.changed';
    }

    /**
     * @return array<string, never>
     */
    public function broadcastWith(): array
    {
        return [];
    }
}
