<?php

namespace App\Jobs\Investments;

use App\Events\Investments\InvestmentDeleted;
use App\Models\Investment;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class DeleteInvestment implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user, public Investment $investment) {}

    public function handle(DatabaseManager $database): void
    {
        $investmentId = $this->investment->id;

        $database->transaction(fn () => $this->investment->delete());

        broadcast(new InvestmentDeleted(user: $this->user, investmentId: $investmentId));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Investment deletion failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
