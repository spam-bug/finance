<?php

namespace App\Http\Controllers\Budgets;

use App\Data\Budgets\CreateBudgetData;
use App\Enums\CategoryType;
use App\Enums\TransactionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Budgets\StoreBudgetRequest;
use App\Jobs\Budgets\CreateBudget;
use App\Jobs\Budgets\DeleteBudget;
use App\Models\Budget;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $month = (int) $request->get('month', now()->month);
        $year = (int) $request->get('year', now()->year);

        $budgets = $user->budgets()->where('month', $month)->where('year', $year)->with('category.parent')->get();

        $expensesByCategory = $user->transactions()
            ->where('type', TransactionType::Expense)
            ->whereMonth('date', $month)->whereYear('date', $year)
            ->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->pluck('total', 'category_id');

        $budgetsWithSpending = $budgets->map(function ($budget) use ($expensesByCategory) {
            $budget->spent = (float) ($expensesByCategory[$budget->category_id] ?? 0);

            return $budget;
        });

        return Inertia::render('budgets/index', [
            'budgets' => $budgetsWithSpending,
            'categories' => Category::query()->whereIn('type', [CategoryType::Expense->value, CategoryType::Both->value])->with('parent')->orderBy('name')->get(),
            'month' => $month,
            'year' => $year,
        ]);
    }

    public function store(StoreBudgetRequest $request): RedirectResponse
    {
        CreateBudget::dispatch(user: $request->user(), data: CreateBudgetData::from($request->validated()));

        return redirect()->back()->with('success', 'Budget saved.');
    }

    public function destroy(Budget $budget): RedirectResponse
    {
        abort_if($budget->user_id !== auth()->id(), 403);

        DeleteBudget::dispatch(user: auth()->user(), budget: $budget);

        return redirect()->back()->with('success', 'Budget removed.');
    }
}
