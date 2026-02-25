<?php

namespace App\Jobs\Budgets;

use App\Data\Budgets\CreateBudgetData;
use App\Models\Budget;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CreateBudget implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user, public CreateBudgetData $data) {}

    public function handle(DatabaseManager $database): void
    {
        $database->transaction(fn () => Budget::query()->updateOrCreate(
            ['user_id' => $this->user->id, 'category_id' => $this->data->category_id, 'month' => $this->data->month, 'year' => $this->data->year],
            ['amount' => $this->data->amount]
        ));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Budget creation failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
