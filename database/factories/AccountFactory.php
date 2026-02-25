<?php

namespace Database\Factories;

use App\Enums\AccountType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Account>
 */
class AccountFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->words(2, true),
            'type' => fake()->randomElement(AccountType::cases()),
            'initial_balance' => fake()->randomFloat(2, 0, 50000),
            'balance' => fake()->randomFloat(2, 0, 50000),
            'notes' => fake()->optional()->sentence(),
            'is_active' => true,
        ];
    }

    public function cash(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AccountType::Cash,
            'name' => 'Cash',
        ]);
    }

    public function bank(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AccountType::Bank,
            'name' => fake()->company().' Bank',
        ]);
    }

    public function eWallet(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AccountType::EWallet,
            'name' => fake()->randomElement(['GCash', 'Maya', 'PayMongo']),
        ]);
    }

    public function investment(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AccountType::Investment,
            'name' => fake()->company().' Fund',
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['is_active' => false]);
    }
}
