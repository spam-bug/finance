<?php

namespace App\Jobs\Transactions;

use App\Enums\TransactionType;
use App\Events\Transactions\TransactionDeleted;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class DeleteTransaction implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $user,
        public Transaction $transaction,
    ) {}

    public function handle(DatabaseManager $database): void
    {
        $transactionId = $this->transaction->id;

        $database->transaction(function () {
            // Reverse transaction's effect on account balance
            if ($this->transaction->type === TransactionType::Income) {
                $this->transaction->account->decrement('balance', $this->transaction->amount);
            } else {
                $this->transaction->account->increment('balance', $this->transaction->amount);
            }

            $this->transaction->delete();
        });

        broadcast(new TransactionDeleted(user: $this->user, transactionId: $transactionId));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Transaction deletion failed after all retries', [
            'user' => $this->user->id,
            'transaction' => $this->transaction->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
