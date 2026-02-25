<?php

namespace Database\Factories;

use App\Enums\Permission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invitation>
 */
class InvitationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'invited_by' => User::factory(),
            'email' => fake()->unique()->safeEmail(),
            'token' => Str::random(64),
            'permission' => Permission::Edit,
            'accepted_at' => null,
            'expires_at' => now()->addDays(7),
        ];
    }

    public function viewOnly(): static
    {
        return $this->state(fn (array $attributes) => ['permission' => Permission::ViewOnly]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => now()->subDay(),
        ]);
    }

    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'accepted_at' => now()->subHours(fake()->numberBetween(1, 48)),
        ]);
    }
}
