<?php

namespace App\Jobs\Savings;

use App\Data\Savings\UpdateSavingsGoalData;
use App\Events\Savings\SavingsGoalUpdated;
use App\Models\SavingsGoal;
use App\Models\User;
use Carbon\Carbon;
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
        $database->transaction(fn () => $this->savingsGoal->update([
            ...$this->data->toArray(),
            'monthly_contribution' => self::computeMonthlyContribution(
                $this->data->target_amount,
                $this->data->current_amount,
                $this->data->target_date,
            ),
        ]));

        broadcast(new SavingsGoalUpdated(user: $this->user, savingsGoal: $this->savingsGoal->fresh()));
    }

    private static function computeMonthlyContribution(float $targetAmount, float $currentAmount, ?string $targetDate): float
    {
        $remaining = max(0, $targetAmount - $currentAmount);

        if (! $targetDate) {
            return 0;
        }

        $months = max(1, (int) now()->diffInMonths(Carbon::parse($targetDate)));

        return round($remaining / $months, 2);
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('SavingsGoal update failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
