<?php

namespace App\Jobs\Accounts;

use App\Data\Accounts\UpdateAccountData;
use App\Events\Accounts\AccountUpdated;
use App\Models\Account;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class UpdateAccount implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $user,
        public Account $account,
        public UpdateAccountData $data,
    ) {}

    public function handle(DatabaseManager $database): void
    {
        $database->transaction(
            callback: fn () => $this->account->update($this->data->toArray())
        );

        broadcast(new AccountUpdated(user: $this->user, account: $this->account->fresh()));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Account update failed after all retries', [
            'user' => $this->user->id,
            'account' => $this->account->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
