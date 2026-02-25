<?php

namespace Database\Factories;

use App\Models\Credit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CreditPayment>
 */
class CreditPaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'credit_id' => Credit::factory(),
            'account_id' => null,
            'transaction_id' => null,
            'amount' => fake()->randomFloat(2, 100, 5000),
            'due_date' => fake()->dateTimeBetween('now', '+1 year')->format('Y-m-d'),
            'paid_at' => null,
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'paid_at' => fake()->dateTimeBetween('-3 months', 'now'),
        ]);
    }

    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'due_date' => fake()->dateTimeBetween('-3 months', '-1 day')->format('Y-m-d'),
            'paid_at' => null,
        ]);
    }
}
