<?php

namespace App\Events\Transactions;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TransactionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Transaction $transaction,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('transactions.'.$this->user->id),
        ];
    }

    public function broadcastWith(): array
    {
        return ['message' => 'Transaction has been updated.'];
    }

    public function broadcastAs(): string
    {
        return 'transactions.updated';
    }
}
