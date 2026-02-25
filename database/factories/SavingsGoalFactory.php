<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SavingsGoal>
 */
class SavingsGoalFactory extends Factory
{
    public function definition(): array
    {
        $targetAmount = fake()->randomFloat(2, 1000, 50000);
        $currentAmount = fake()->randomFloat(2, 0, $targetAmount * 0.9);

        return [
            'user_id' => User::factory(),
            'account_id' => null,
            'name' => fake()->words(3, true),
            'monthly_contribution' => fake()->randomFloat(2, 100, 5000),
            'target_amount' => $targetAmount,
            'current_amount' => $currentAmount,
            'target_date' => fake()->optional()->dateTimeBetween('now', '+2 years')?->format('Y-m-d'),
        ];
    }
}
