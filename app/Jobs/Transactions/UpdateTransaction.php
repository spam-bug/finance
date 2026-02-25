<?php

namespace App\Jobs\Transactions;

use App\Data\Transactions\UpdateTransactionData;
use App\Enums\TransactionType;
use App\Events\Transactions\TransactionUpdated;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class UpdateTransaction implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $user,
        public Transaction $transaction,
        public UpdateTransactionData $data,
    ) {}

    public function handle(DatabaseManager $database): void
    {
        $database->transaction(function () {
            $oldAccount = Account::query()->findOrFail($this->transaction->account_id);

            // Reverse old transaction's effect on the old account
            if ($this->transaction->type === TransactionType::Income) {
                $oldAccount->decrement('balance', $this->transaction->amount);
            } else {
                $oldAccount->increment('balance', $this->transaction->amount);
            }

            $newAccount = Account::query()->findOrFail($this->data->account_id);

            // Apply new transaction's effect on the new account
            if ($this->data->type === TransactionType::Income) {
                $newAccount->increment('balance', $this->data->amount);
            } else {
                $newAccount->decrement('balance', $this->data->amount);
            }

            $this->transaction->update($this->data->toArray());
        });

        broadcast(new TransactionUpdated(user: $this->user, transaction: $this->transaction->fresh()->load(['account', 'category'])));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Transaction update failed after all retries', [
            'user' => $this->user->id,
            'transaction' => $this->transaction->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
