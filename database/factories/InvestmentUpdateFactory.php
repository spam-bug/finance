<?php

namespace Database\Factories;

use App\Models\Investment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\InvestmentUpdate>
 */
class InvestmentUpdateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'investment_id' => Investment::factory(),
            'value' => fake()->randomFloat(2, 500, 150000),
            'date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
