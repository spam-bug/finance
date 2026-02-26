<?php

namespace Database\Seeders;

use App\Enums\CategoryType;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->seedCategories();
    }

    private function seedCategories(): void
    {
        $incomeCategories = ['Salary', 'Freelance', 'Business', 'Other Income'];

        foreach ($incomeCategories as $name) {
            Category::query()->create([
                'name' => $name,
                'type' => CategoryType::Income,
            ]);
        }

        $expenseGroups = [
            'Utilities' => ['Electricity', 'Water', 'Internet', 'Gas'],
            'Food' => ['Groceries', 'Dining Out', 'Coffee'],
            'Transport' => ['Fuel', 'Public Transport', 'Ride Share'],
            'Health' => ['Medicine', 'Doctor', 'Hospital'],
            'Entertainment' => ['Subscriptions', 'Recreation', 'Travel'],
            'Housing' => ['Rent', 'Maintenance', 'Supplies'],
        ];

        foreach ($expenseGroups as $parentName => $children) {
            $parent = Category::query()->create([
                'name' => $parentName,
                'type' => CategoryType::Expense,
            ]);

            foreach ($children as $childName) {
                Category::query()->create([
                    'parent_id' => $parent->id,
                    'name' => $childName,
                    'type' => CategoryType::Expense,
                ]);
            }
        }

        Category::query()->create([
            'name' => 'Other',
            'type' => CategoryType::Both,
        ]);
    }
}
