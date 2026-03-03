<?php

namespace Database\Seeders;

use App\Enums\AccountType;
use App\Enums\CategoryType;
use App\Enums\CreditPaymentFrequency;
use App\Enums\Permission;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Credit;
use App\Models\CreditPayment;
use App\Models\Goal;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'permission' => Permission::Edit,
        ]);

        $this->seedCategories();

        $categories = Category::query()->get()->keyBy('name');

        $bank = Account::query()->create([
            'user_id' => $user->id,
            'name' => 'Main Bank',
            'type' => AccountType::Bank,
            'initial_balance' => 50000,
            'balance' => 50000,
            'is_active' => true,
        ]);

        $cash = Account::query()->create([
            'user_id' => $user->id,
            'name' => 'Cash Wallet',
            'type' => AccountType::Cash,
            'initial_balance' => 5000,
            'balance' => 5000,
            'is_active' => true,
        ]);

        $this->seedTransactions($user, $bank, $cash, $categories);
        $this->seedCredit($user, $bank);
        $this->seedSavingsGoals($user, $bank);
        $this->seedGoals($user, $bank);
        $this->seedBudgets($user, $categories);
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

    /**
     * @param  \Illuminate\Support\Collection<string, Category>  $categories
     */
    private function seedTransactions(User $user, Account $bank, Account $cash, $categories): void
    {
        $monthlyExpenses = [
            ['category' => 'Rent', 'account' => $bank, 'min' => 18000, 'max' => 18000],
            ['category' => 'Groceries', 'account' => $cash, 'min' => 8000, 'max' => 12000],
            ['category' => 'Electricity', 'account' => $bank, 'min' => 2500, 'max' => 3500],
            ['category' => 'Water', 'account' => $bank, 'min' => 500, 'max' => 800],
            ['category' => 'Internet', 'account' => $bank, 'min' => 1500, 'max' => 1500],
            ['category' => 'Fuel', 'account' => $cash, 'min' => 3000, 'max' => 5000],
            ['category' => 'Subscriptions', 'account' => $bank, 'min' => 500, 'max' => 500],
            ['category' => 'Dining Out', 'account' => $cash, 'min' => 3000, 'max' => 6000],
        ];

        $occasionalExpenses = [
            ['category' => 'Medicine', 'account' => $cash, 'min' => 500, 'max' => 2000],
            ['category' => 'Recreation', 'account' => $cash, 'min' => 1000, 'max' => 3000],
            ['category' => 'Coffee', 'account' => $cash, 'min' => 800, 'max' => 1500],
            ['category' => 'Maintenance', 'account' => $bank, 'min' => 1000, 'max' => 5000],
        ];

        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->startOfMonth()->subMonths($i);

            Transaction::query()->create([
                'user_id' => $user->id,
                'account_id' => $bank->id,
                'category_id' => $categories['Salary']->id,
                'type' => TransactionType::Income,
                'amount' => 85000,
                'date' => $month->copy()->day(5),
                'description' => 'Monthly salary',
            ]);

            if ($i % 2 === 0) {
                Transaction::query()->create([
                    'user_id' => $user->id,
                    'account_id' => $bank->id,
                    'category_id' => $categories['Freelance']->id,
                    'type' => TransactionType::Income,
                    'amount' => rand(15000, 30000),
                    'date' => $month->copy()->day(15),
                    'description' => 'Freelance project payment',
                ]);
            }

            foreach ($monthlyExpenses as $expense) {
                Transaction::query()->create([
                    'user_id' => $user->id,
                    'account_id' => $expense['account']->id,
                    'category_id' => $categories[$expense['category']]->id,
                    'type' => TransactionType::Expense,
                    'amount' => rand($expense['min'], $expense['max']),
                    'date' => $month->copy()->day(rand(1, 28)),
                    'description' => $expense['category'],
                ]);
            }

            $picked = collect($occasionalExpenses)->shuffle()->take(rand(2, 3));

            foreach ($picked as $expense) {
                Transaction::query()->create([
                    'user_id' => $user->id,
                    'account_id' => $expense['account']->id,
                    'category_id' => $categories[$expense['category']]->id,
                    'type' => TransactionType::Expense,
                    'amount' => rand($expense['min'], $expense['max']),
                    'date' => $month->copy()->day(rand(1, 28)),
                    'description' => $expense['category'],
                ]);
            }
        }

        $this->recalculateBalance($bank);
        $this->recalculateBalance($cash);
    }

    private function recalculateBalance(Account $account): void
    {
        $income = Transaction::query()
            ->where('account_id', $account->id)
            ->where('type', TransactionType::Income)
            ->sum('amount');

        $expenses = Transaction::query()
            ->where('account_id', $account->id)
            ->where('type', TransactionType::Expense)
            ->sum('amount');

        $account->update(['balance' => $account->initial_balance + $income - $expenses]);
    }

    private function seedCredit(User $user, Account $bank): void
    {
        $startDate = Carbon::now()->subMonths(12)->startOfMonth();

        $credit = Credit::query()->create([
            'user_id' => $user->id,
            'name' => 'Car Loan',
            'total_amount' => 600000,
            'payment_frequency' => CreditPaymentFrequency::Monthly,
            'number_of_payments' => 36,
            'amount_per_payment' => 16667,
            'start_date' => $startDate,
            'notes' => 'Monthly car loan payment',
        ]);

        for ($i = 0; $i < 36; $i++) {
            $dueDate = $startDate->copy()->addMonths($i)->day(10);
            $isPaid = $dueDate->isPast();

            CreditPayment::query()->create([
                'credit_id' => $credit->id,
                'account_id' => $isPaid ? $bank->id : null,
                'amount' => 16667,
                'due_date' => $dueDate,
                'paid_at' => $isPaid ? $dueDate->copy()->subDays(rand(0, 3)) : null,
            ]);
        }
    }

    private function seedSavingsGoals(User $user, Account $bank): void
    {
        SavingsGoal::query()->create([
            'user_id' => $user->id,
            'account_id' => $bank->id,
            'name' => 'Emergency Fund',
            'target_amount' => 200000,
            'current_amount' => 85000,
            'monthly_contribution' => 5000,
            'target_date' => Carbon::now()->addMonths(23),
        ]);

        SavingsGoal::query()->create([
            'user_id' => $user->id,
            'account_id' => $bank->id,
            'name' => 'Vacation Fund',
            'target_amount' => 50000,
            'current_amount' => 22000,
            'monthly_contribution' => 3000,
            'target_date' => Carbon::now()->addMonths(10),
        ]);

        SavingsGoal::query()->create([
            'user_id' => $user->id,
            'account_id' => $bank->id,
            'name' => 'Down Payment',
            'target_amount' => 500000,
            'current_amount' => 145000,
            'monthly_contribution' => 15000,
            'target_date' => Carbon::now()->addMonths(24),
        ]);
    }

    private function seedGoals(User $user, Account $bank): void
    {
        Goal::query()->create([
            'user_id' => $user->id,
            'account_id' => $bank->id,
            'name' => 'New Laptop',
            'target_amount' => 80000,
            'current_amount' => 35000,
            'target_date' => Carbon::now()->addMonths(3),
            'notes' => 'MacBook Pro for work',
        ]);

        Goal::query()->create([
            'user_id' => $user->id,
            'account_id' => $bank->id,
            'name' => 'Home Renovation',
            'target_amount' => 500000,
            'current_amount' => 120000,
            'target_date' => Carbon::now()->addMonths(18),
            'notes' => 'Kitchen and living room update',
        ]);

        Goal::query()->create([
            'user_id' => $user->id,
            'account_id' => null,
            'name' => 'New Smartphone',
            'target_amount' => 55000,
            'current_amount' => 20000,
            'target_date' => Carbon::now()->addMonths(4),
        ]);
    }

    /**
     * @param  \Illuminate\Support\Collection<string, Category>  $categories
     */
    private function seedBudgets(User $user, $categories): void
    {
        $month = (int) now()->month;
        $year = (int) now()->year;

        $budgets = [
            'Rent' => 18000,
            'Groceries' => 12000,
            'Electricity' => 3500,
            'Water' => 800,
            'Internet' => 1500,
            'Fuel' => 5000,
            'Subscriptions' => 500,
            'Dining Out' => 5000,
            'Medicine' => 2000,
            'Recreation' => 3000,
        ];

        foreach ($budgets as $categoryName => $amount) {
            if ($categories->has($categoryName)) {
                Budget::query()->create([
                    'user_id' => $user->id,
                    'category_id' => $categories[$categoryName]->id,
                    'amount' => $amount,
                    'month' => $month,
                    'year' => $year,
                ]);
            }
        }
    }
}
