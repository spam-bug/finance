<?php

namespace App\Jobs\Accounts;

use App\Data\Accounts\CreateAccountData;
use App\Events\Accounts\AccountCreated;
use App\Models\Account;
use App\Models\User;
use App\Notifications\ActivityNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CreateAccount implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $user,
        public CreateAccountData $data,
    ) {}

    public function handle(DatabaseManager $database): void
    {
        $account = $database->transaction(
            callback: fn () => Account::query()->create([
                ...$this->data->toArray(),
                'user_id' => $this->user->id,
                'balance' => $this->data->initial_balance,
            ])
        );

        broadcast(new AccountCreated(user: $this->user, account: $account));

        $this->user->notify(new ActivityNotification(
            message: "Account \"{$account->name}\" was created.",
            type: 'account_created',
        ));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Account creation failed after all retries', [
            'user' => $this->user->id,
            'data' => $this->data,
            'error' => $exception->getMessage(),
        ]);
    }
}
