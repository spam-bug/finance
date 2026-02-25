<?php

namespace App\Http\Controllers\Savings;

use App\Data\Savings\CreateSavingsGoalData;
use App\Data\Savings\UpdateSavingsGoalData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Savings\StoreSavingsGoalRequest;
use App\Http\Requests\Savings\UpdateSavingsGoalRequest;
use App\Jobs\Savings\CreateSavingsGoal;
use App\Jobs\Savings\DeleteSavingsGoal;
use App\Jobs\Savings\UpdateSavingsGoal;
use App\Models\SavingsGoal;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SavingsGoalController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        return Inertia::render('savings/index', [
            'savings_goals' => $user->savingsGoals()->with('account')->orderBy('name')->get(),
            'accounts' => $user->accounts()->where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function store(StoreSavingsGoalRequest $request): RedirectResponse
    {
        CreateSavingsGoal::dispatch(user: $request->user(), data: CreateSavingsGoalData::from($request->validated()));

        return redirect()->back()->with('success', 'Savings goal created.');
    }

    public function update(UpdateSavingsGoalRequest $request, SavingsGoal $savings_goal): RedirectResponse
    {
        UpdateSavingsGoal::dispatch(user: $request->user(), savingsGoal: $savings_goal, data: UpdateSavingsGoalData::from($request->validated()));

        return redirect()->back()->with('success', 'Savings goal updated.');
    }

    public function destroy(SavingsGoal $savings_goal): RedirectResponse
    {
        abort_if($savings_goal->user_id !== auth()->id(), 403);

        DeleteSavingsGoal::dispatch(user: auth()->user(), savingsGoal: $savings_goal);

        return redirect()->back()->with('success', 'Savings goal deleted.');
    }
}
