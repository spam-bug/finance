<?php

namespace App\Jobs\Investments;

use App\Data\Investments\CreateInvestmentData;
use App\Events\Investments\InvestmentCreated;
use App\Models\Investment;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CreateInvestment implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user, public CreateInvestmentData $data) {}

    public function handle(DatabaseManager $database): void
    {
        $investment = $database->transaction(
            fn () => Investment::query()->create([...$this->data->toArray(), 'user_id' => $this->user->id])
        );

        broadcast(new InvestmentCreated(user: $this->user, investment: $investment));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Investment creation failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
