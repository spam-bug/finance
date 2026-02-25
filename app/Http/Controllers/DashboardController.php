<?php

namespace App\Http\Controllers;

use App\Enums\TransactionType;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $user = auth()->user();
        $now = now();

        // Account balances
        $accounts = $user->accounts()->where('is_active', true)->get(['id', 'name', 'type', 'balance']);

        // Current month income vs expenses
        $currentMonthTransactions = $user->transactions()
            ->whereMonth('date', $now->month)
            ->whereYear('date', $now->year)
            ->get(['type', 'amount', 'category_id', 'date']);

        $monthlyIncome = $currentMonthTransactions->where('type', TransactionType::Income)->sum('amount');
        $monthlyExpenses = $currentMonthTransactions->where('type', TransactionType::Expense)->sum('amount');

        // Last 6 months income vs expenses
        $sixMonthsData = collect(range(5, 0))->map(function ($monthsAgo) use ($user) {
            $date = now()->subMonths($monthsAgo);

            $transactions = $user->transactions()
                ->whereMonth('date', $date->month)
                ->whereYear('date', $date->year)
                ->get(['type', 'amount']);

            return [
                'month' => $date->format('M Y'),
                'income' => (float) $transactions->where('type', TransactionType::Income)->sum('amount'),
                'expenses' => (float) $transactions->where('type', TransactionType::Expense)->sum('amount'),
            ];
        });

        // Expenses by category this month
        $expensesByCategory = $user->transactions()
            ->where('type', TransactionType::Expense)
            ->whereMonth('date', $now->month)
            ->whereYear('date', $now->year)
            ->with('category')
            ->get(['amount', 'category_id'])
            ->groupBy(fn ($t) => $t->category?->name ?? 'Uncategorized')
            ->map(fn ($group) => round((float) $group->sum('amount'), 2))
            ->sortByDesc(fn ($v) => $v)
            ->take(8);

        // Active budgets with spending
        $budgets = $user->budgets()
            ->where('month', $now->month)
            ->where('year', $now->year)
            ->with('category')
            ->get();

        $budgetUsage = $budgets->map(function ($budget) use ($user, $now) {
            $spent = $user->transactions()
                ->where('type', TransactionType::Expense)
                ->where('category_id', $budget->category_id)
                ->whereMonth('date', $now->month)
                ->whereYear('date', $now->year)
                ->sum('amount');

            return [
                'category' => $budget->category?->name ?? 'Unknown',
                'budget' => (float) $budget->amount,
                'spent' => (float) $spent,
            ];
        });

        // Investment total
        $totalInvestmentValue = $user->investments()->sum('current_value');

        // Upcoming credit payments
        $upcomingPayments = $user->credits()
            ->with(['payments' => fn ($q) => $q->whereNull('paid_at')->orderBy('due_date')->limit(3)])
            ->get()
            ->flatMap(fn ($credit) => $credit->payments->map(fn ($p) => [
                'credit_name' => $credit->name,
                'amount' => (float) $p->amount,
                'due_date' => $p->due_date->toDateString(),
            ]))
            ->sortBy('due_date')
            ->take(5)
            ->values();

        return Inertia::render('dashboard', [
            'accounts' => $accounts,
            'monthlyIncome' => (float) $monthlyIncome,
            'monthlyExpenses' => (float) $monthlyExpenses,
            'sixMonthsData' => $sixMonthsData->values(),
            'expensesByCategory' => $expensesByCategory->map(fn ($v, $k) => ['name' => $k, 'value' => $v])->values(),
            'budgetUsage' => $budgetUsage->values(),
            'totalInvestmentValue' => (float) $totalInvestmentValue,
            'upcomingPayments' => $upcomingPayments,
        ]);
    }
}
