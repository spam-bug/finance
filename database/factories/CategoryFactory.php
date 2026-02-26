<?php

namespace Database\Factories;

use App\Enums\CategoryType;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'parent_id' => null,
            'name' => fake()->word(),
            'type' => fake()->randomElement(CategoryType::cases()),
            'color' => fake()->optional()->hexColor(),
        ];
    }

    public function income(): static
    {
        return $this->state(fn (array $attributes) => ['type' => CategoryType::Income]);
    }

    public function expense(): static
    {
        return $this->state(fn (array $attributes) => ['type' => CategoryType::Expense]);
    }

    public function withParent(Category $parent): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => $parent->id,
            'type' => $parent->type,
        ]);
    }
}
