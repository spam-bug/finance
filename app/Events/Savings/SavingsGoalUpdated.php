<?php

namespace App\Events\Savings;

use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SavingsGoalUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public SavingsGoal $savingsGoal,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('savings.'.$this->user->id),
        ];
    }

    public function broadcastWith(): array
    {
        return ['message' => 'Savings goal has been updated.'];
    }

    public function broadcastAs(): string
    {
        return 'savings.updated';
    }
}
