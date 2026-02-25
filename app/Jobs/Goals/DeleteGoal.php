<?php

namespace App\Jobs\Goals;

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
        $database->transaction(fn () => $this->goal->delete());
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Goal deletion failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
