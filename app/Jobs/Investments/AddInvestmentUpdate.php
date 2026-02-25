<?php

namespace App\Jobs\Investments;

use App\Data\Investments\AddInvestmentUpdateData;
use App\Models\Investment;
use App\Models\InvestmentUpdate;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class AddInvestmentUpdate implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user, public Investment $investment, public AddInvestmentUpdateData $data) {}

    public function handle(DatabaseManager $database): void
    {
        $database->transaction(function () {
            InvestmentUpdate::query()->create([...$this->data->toArray(), 'investment_id' => $this->investment->id]);
            $this->investment->update(['current_value' => $this->data->value]);
        });
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('InvestmentUpdate creation failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
