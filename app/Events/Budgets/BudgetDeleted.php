<?php

namespace App\Events\Budgets;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BudgetDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public int $budgetId,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('budgets.'.$this->user->id),
        ];
    }

    public function broadcastWith(): array
    {
        return ['message' => 'Budget has been deleted.'];
    }

    public function broadcastAs(): string
    {
        return 'budgets.deleted';
    }
}
