<?php

namespace App\Events\Goals;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GoalDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public int $goalId,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('goals.'.$this->user->id),
        ];
    }

    public function broadcastWith(): array
    {
        return ['message' => 'Goal has been deleted.'];
    }

    public function broadcastAs(): string
    {
        return 'goals.deleted';
    }
}
