<?php

namespace App\Jobs\Accounts;

use App\Events\Accounts\AccountDeleted;
use App\Models\Account;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class DeleteAccount implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $user,
        public Account $account,
    ) {}

    public function handle(DatabaseManager $database): void
    {
        $accountId = $this->account->id;

        $database->transaction(
            callback: fn () => $this->account->delete()
        );

        broadcast(new AccountDeleted(user: $this->user, accountId: $accountId));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Account deletion failed after all retries', [
            'user' => $this->user->id,
            'account' => $this->account->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
