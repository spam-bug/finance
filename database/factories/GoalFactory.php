<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Goal>
 */
class GoalFactory extends Factory
{
    public function definition(): array
    {
        $targetAmount = fake()->randomFloat(2, 5000, 500000);
        $currentAmount = fake()->randomFloat(2, 0, $targetAmount * 0.7);

        return [
            'user_id' => User::factory(),
            'account_id' => null,
            'name' => fake()->words(3, true),
            'target_amount' => $targetAmount,
            'current_amount' => $currentAmount,
            'target_date' => fake()->optional()->dateTimeBetween('now', '+3 years')?->format('Y-m-d'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
