<?php

namespace Database\Seeders;

use App\Enums\AccountType;
use App\Enums\CategoryType;
use App\Models\Account;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->seedCategories($user);
        $this->seedAccounts($user);
    }

    private function seedCategories(User $user): void
    {
        $incomeCategories = ['Salary', 'Freelance', 'Business', 'Other Income'];

        foreach ($incomeCategories as $name) {
            Category::query()->create([
                'user_id' => $user->id,
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
                'user_id' => $user->id,
                'name' => $parentName,
                'type' => CategoryType::Expense,
            ]);

            foreach ($children as $childName) {
                Category::query()->create([
                    'user_id' => $user->id,
                    'parent_id' => $parent->id,
                    'name' => $childName,
                    'type' => CategoryType::Expense,
                ]);
            }
        }

        Category::query()->create([
            'user_id' => $user->id,
            'name' => 'Other',
            'type' => CategoryType::Both,
        ]);
    }

    private function seedAccounts(User $user): void
    {
        Account::query()->create([
            'user_id' => $user->id,
            'name' => 'Cash',
            'type' => AccountType::Cash,
            'initial_balance' => 5000.00,
            'balance' => 5000.00,
        ]);

        Account::query()->create([
            'user_id' => $user->id,
            'name' => 'Main Bank',
            'type' => AccountType::Bank,
            'initial_balance' => 25000.00,
            'balance' => 25000.00,
        ]);
    }
}
