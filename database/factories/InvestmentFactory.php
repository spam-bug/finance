<?php

namespace Database\Factories;

use App\Enums\InvestmentType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Investment>
 */
class InvestmentFactory extends Factory
{
    public function definition(): array
    {
        $initialValue = fake()->randomFloat(2, 1000, 100000);

        return [
            'user_id' => User::factory(),
            'account_id' => null,
            'name' => fake()->company().' '.fake()->randomElement(['Fund', 'Stock', 'Bond']),
            'type' => fake()->randomElement(InvestmentType::cases()),
            'initial_value' => $initialValue,
            'current_value' => $initialValue * fake()->randomFloat(2, 0.8, 1.5),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function shares(): static
    {
        return $this->state(fn (array $attributes) => ['type' => InvestmentType::Shares]);
    }

    public function bonds(): static
    {
        return $this->state(fn (array $attributes) => ['type' => InvestmentType::Bonds]);
    }
}
