<?php

namespace App\Jobs\Savings;

use App\Events\Savings\SavingsGoalDeleted;
use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class DeleteSavingsGoal implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user, public SavingsGoal $savingsGoal) {}

    public function handle(DatabaseManager $database): void
    {
        $savingsGoalId = $this->savingsGoal->id;

        $database->transaction(fn () => $this->savingsGoal->delete());

        broadcast(new SavingsGoalDeleted(user: $this->user, savingsGoalId: $savingsGoalId));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('SavingsGoal deletion failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
