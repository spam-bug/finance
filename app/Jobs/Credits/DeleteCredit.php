<?php

namespace App\Jobs\Credits;

use App\Events\Credits\CreditDeleted;
use App\Models\Credit;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class DeleteCredit implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $user,
        public Credit $credit,
    ) {}

    public function handle(DatabaseManager $database): void
    {
        $creditId = $this->credit->id;

        $database->transaction(
            callback: fn () => $this->credit->delete()
        );

        broadcast(new CreditDeleted(user: $this->user, creditId: $creditId));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Credit deletion failed after all retries', [
            'user' => $this->user->id,
            'credit' => $this->credit->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
