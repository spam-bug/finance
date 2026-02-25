<?php

namespace App\Http\Controllers\Goals;

use App\Data\Goals\CreateGoalData;
use App\Data\Goals\UpdateGoalData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Goals\StoreGoalRequest;
use App\Http\Requests\Goals\UpdateGoalRequest;
use App\Jobs\Goals\CreateGoal;
use App\Jobs\Goals\DeleteGoal;
use App\Jobs\Goals\UpdateGoal;
use App\Models\Goal;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class GoalController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        return Inertia::render('budgets/goals', [
            'goals' => $user->goals()->with('account')->orderBy('name')->get(),
            'accounts' => $user->accounts()->where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function store(StoreGoalRequest $request): RedirectResponse
    {
        CreateGoal::dispatch(user: $request->user(), data: CreateGoalData::from($request->validated()));

        return redirect()->back()->with('success', 'Goal created.');
    }

    public function update(UpdateGoalRequest $request, Goal $goal): RedirectResponse
    {
        UpdateGoal::dispatch(user: $request->user(), goal: $goal, data: UpdateGoalData::from($request->validated()));

        return redirect()->back()->with('success', 'Goal updated.');
    }

    public function destroy(Goal $goal): RedirectResponse
    {
        abort_if($goal->user_id !== auth()->id(), 403);

        DeleteGoal::dispatch(user: auth()->user(), goal: $goal);

        return redirect()->back()->with('success', 'Goal deleted.');
    }
}
