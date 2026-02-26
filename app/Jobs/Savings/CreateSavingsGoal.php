<?php

namespace App\Jobs\Savings;

use App\Data\Savings\CreateSavingsGoalData;
use App\Events\Savings\SavingsGoalCreated;
use App\Models\SavingsGoal;
use App\Models\User;
use Carbon\Carbon;
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
        $savingsGoal = $database->transaction(
            fn () => SavingsGoal::query()->create([
                ...$this->data->toArray(),
                'user_id' => $this->user->id,
                'monthly_contribution' => self::computeMonthlyContribution(
                    $this->data->target_amount,
                    $this->data->current_amount,
                    $this->data->target_date,
                ),
            ])
        );

        broadcast(new SavingsGoalCreated(user: $this->user, savingsGoal: $savingsGoal));
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
        Log::critical('SavingsGoal creation failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
