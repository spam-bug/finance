<?php

namespace App\Jobs\Transactions;

use App\Data\Transactions\CreateTransactionData;
use App\Enums\TransactionType;
use App\Events\Transactions\TransactionCreated;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\ActivityNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CreateTransaction implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $user,
        public CreateTransactionData $data,
    ) {}

    public function handle(DatabaseManager $database): void
    {
        $transaction = $database->transaction(function () {
            $account = Account::query()->findOrFail($this->data->account_id);

            $tx = Transaction::query()->create([
                ...$this->data->toArray(),
                'user_id' => $this->user->id,
            ]);

            if ($this->data->type === TransactionType::Income) {
                $account->increment('balance', $this->data->amount);
            } else {
                $account->decrement('balance', $this->data->amount);
            }

            return $tx;
        });

        broadcast(new TransactionCreated(user: $this->user, transaction: $transaction->load(['account', 'category'])));

        $typeLabel = $this->data->type === TransactionType::Income ? 'income' : 'expense';
        $amount = '₱'.number_format((float) $this->data->amount, 2);
        $this->user->notify(new ActivityNotification(
            message: "New {$typeLabel} of {$amount} recorded.",
            type: 'transaction_created',
        ));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Transaction creation failed after all retries', [
            'user' => $this->user->id,
            'data' => $this->data,
            'error' => $exception->getMessage(),
        ]);
    }
}
