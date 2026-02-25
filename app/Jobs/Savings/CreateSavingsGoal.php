<?php

namespace App\Jobs\Savings;

use App\Data\Savings\CreateSavingsGoalData;
use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CreateSavingsGoal implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user, public CreateSavingsGoalData $data) {}

    public function handle(DatabaseManager $database): void
    {
        $database->transaction(fn () => SavingsGoal::query()->create([...$this->data->toArray(), 'user_id' => $this->user->id]));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('SavingsGoal creation failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
