<?php

namespace App\Events\Investments;

use App\Models\Investment;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InvestmentUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Investment $investment,
    ) {}

    /**
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('investments.'.$this->user->id),
        ];
    }

    public function broadcastWith(): array
    {
        return ['message' => 'Investment has been updated.'];
    }

    public function broadcastAs(): string
    {
        return 'investments.updated';
    }
}
