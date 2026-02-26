<?php

namespace App\Events\Credits;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CreditDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public int $creditId,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('credits.'.$this->user->id),
        ];
    }

    public function broadcastWith(): array
    {
        return ['message' => 'Credit has been deleted.'];
    }

    public function broadcastAs(): string
    {
        return 'credits.deleted';
    }
}
