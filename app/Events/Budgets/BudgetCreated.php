<?php

namespace App\Events\Budgets;

use App\Models\Budget;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BudgetCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Budget $budget,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('budgets.'.$this->user->id),
        ];
    }

    public function broadcastWith(): array
    {
        return ['message' => 'Budget has been created.'];
    }

    public function broadcastAs(): string
    {
        return 'budgets.created';
    }
}
