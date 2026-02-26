<?php

namespace App\Jobs\Credits;

use App\Enums\TransactionType;
use App\Events\Credits\CreditPaymentPaid;
use App\Models\Account;
use App\Models\CreditPayment;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\ActivityNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class PayCreditPayment implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $user,
        public CreditPayment $payment,
        public int $accountId,
    ) {}

    public function handle(DatabaseManager $database): void
    {
        $database->transaction(function () {
            $account = Account::query()->findOrFail($this->accountId);

            $transaction = Transaction::query()->create([
                'user_id' => $this->user->id,
                'account_id' => $this->accountId,
                'type' => TransactionType::Expense,
                'amount' => $this->payment->amount,
                'date' => now()->toDateString(),
                'description' => 'Credit payment: '.$this->payment->credit->name,
            ]);

            $account->decrement('balance', $this->payment->amount);

            $this->payment->update([
                'paid_at' => now(),
                'account_id' => $this->accountId,
                'transaction_id' => $transaction->id,
            ]);
        });

        $freshPayment = $this->payment->fresh()->load(['credit', 'account']);
        broadcast(new CreditPaymentPaid(user: $this->user, payment: $freshPayment));

        $amount = '₱'.number_format((float) $this->payment->amount, 2);
        $this->user->notify(new ActivityNotification(
            message: "Credit payment of {$amount} for \"{$this->payment->credit->name}\" was made.",
            type: 'credit_payment_made',
        ));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Credit payment failed after all retries', [
            'user' => $this->user->id,
            'payment' => $this->payment->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
