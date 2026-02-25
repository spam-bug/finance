<?php

namespace App\Jobs\Budgets;

use App\Events\Budgets\BudgetDeleted;
use App\Models\Budget;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class DeleteBudget implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user, public Budget $budget) {}

    public function handle(DatabaseManager $database): void
    {
        $budgetId = $this->budget->id;

        $database->transaction(fn () => $this->budget->delete());

        broadcast(new BudgetDeleted(user: $this->user, budgetId: $budgetId));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Budget deletion failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
