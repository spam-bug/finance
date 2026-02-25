<?php

namespace App\Jobs\Investments;

use App\Data\Investments\UpdateInvestmentData;
use App\Models\Investment;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class UpdateInvestment implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user, public Investment $investment, public UpdateInvestmentData $data) {}

    public function handle(DatabaseManager $database): void
    {
        $database->transaction(fn () => $this->investment->update($this->data->toArray()));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Investment update failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
