<?php

namespace App\Jobs\Goals;

use App\Events\Goals\GoalDeleted;
use App\Models\Goal;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class DeleteGoal implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user, public Goal $goal) {}

    public function handle(DatabaseManager $database): void
    {
        $goalId = $this->goal->id;

        $database->transaction(fn () => $this->goal->delete());

        broadcast(new GoalDeleted(user: $this->user, goalId: $goalId));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Goal deletion failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
