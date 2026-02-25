<?php

namespace App\Jobs\Goals;

use App\Data\Goals\UpdateGoalData;
use App\Events\Goals\GoalUpdated;
use App\Models\Goal;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class UpdateGoal implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user, public Goal $goal, public UpdateGoalData $data) {}

    public function handle(DatabaseManager $database): void
    {
        $database->transaction(fn () => $this->goal->update($this->data->toArray()));

        broadcast(new GoalUpdated(user: $this->user, goal: $this->goal->fresh()));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Goal update failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
