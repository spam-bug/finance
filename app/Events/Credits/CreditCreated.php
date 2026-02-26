<?php

namespace App\Events\Credits;

use App\Models\Credit;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CreditCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Credit $credit,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('credits.'.$this->user->id),
        ];
    }

    public function broadcastWith(): array
    {
        return ['message' => 'Credit has been created.'];
    }

    public function broadcastAs(): string
    {
        return 'credits.created';
    }
}
