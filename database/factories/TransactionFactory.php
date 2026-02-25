<?php

namespace Database\Factories;

use App\Enums\TransactionFrequency;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Transaction>
 */
class TransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'account_id' => Account::factory(),
            'category_id' => null,
            'parent_id' => null,
            'type' => fake()->randomElement(TransactionType::cases()),
            'amount' => fake()->randomFloat(2, 10, 10000),
            'date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'description' => fake()->optional()->sentence(4),
            'notes' => fake()->optional()->sentence(),
            'frequency' => TransactionFrequency::OneTime,
            'is_recurring' => false,
        ];
    }

    public function income(): static
    {
        return $this->state(fn (array $attributes) => ['type' => TransactionType::Income]);
    }

    public function expense(): static
    {
        return $this->state(fn (array $attributes) => ['type' => TransactionType::Expense]);
    }

    public function recurring(TransactionFrequency $frequency = TransactionFrequency::Monthly): static
    {
        return $this->state(fn (array $attributes) => [
            'frequency' => $frequency,
            'is_recurring' => true,
        ]);
    }

    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
            'account_id' => Account::factory()->for($user),
        ]);
    }
}
