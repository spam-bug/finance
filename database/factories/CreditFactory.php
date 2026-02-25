<?php

namespace Database\Factories;

use App\Enums\CreditPaymentFrequency;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Credit>
 */
class CreditFactory extends Factory
{
    public function definition(): array
    {
        $numberOfPayments = fake()->numberBetween(3, 24);
        $totalAmount = fake()->randomFloat(2, 1000, 100000);

        return [
            'user_id' => User::factory(),
            'name' => fake()->words(3, true),
            'total_amount' => $totalAmount,
            'payment_frequency' => CreditPaymentFrequency::Monthly,
            'number_of_payments' => $numberOfPayments,
            'amount_per_payment' => round($totalAmount / $numberOfPayments, 2),
            'start_date' => fake()->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function monthly(): static
    {
        return $this->state(fn (array $attributes) => ['payment_frequency' => CreditPaymentFrequency::Monthly]);
    }

    public function quarterly(): static
    {
        return $this->state(fn (array $attributes) => ['payment_frequency' => CreditPaymentFrequency::Quarterly]);
    }
}
