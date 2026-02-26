<?php

namespace App\Jobs\Goals;

use App\Data\Goals\CreateGoalData;
use App\Events\Goals\GoalCreated;
use App\Models\Goal;
use App\Models\User;
use App\Notifications\ActivityNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CreateGoal implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user, public CreateGoalData $data) {}

    public function handle(DatabaseManager $database): void
    {
        $goal = $database->transaction(
            fn () => Goal::query()->create([...$this->data->toArray(), 'user_id' => $this->user->id])
        );

        broadcast(new GoalCreated(user: $this->user, goal: $goal));

        $this->user->notify(new ActivityNotification(
            message: "Goal \"{$goal->name}\" was created.",
            type: 'goal_created',
        ));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Goal creation failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
