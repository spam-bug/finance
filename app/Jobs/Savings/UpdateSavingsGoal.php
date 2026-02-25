<?php

namespace App\Jobs\Savings;

use App\Data\Savings\UpdateSavingsGoalData;
use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class UpdateSavingsGoal implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user, public SavingsGoal $savingsGoal, public UpdateSavingsGoalData $data) {}

    public function handle(DatabaseManager $database): void
    {
        $database->transaction(fn () => $this->savingsGoal->update($this->data->toArray()));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('SavingsGoal update failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
