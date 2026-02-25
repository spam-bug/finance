<?php

namespace App\Http\Controllers\Investments;

use App\Data\Investments\AddInvestmentUpdateData;
use App\Data\Investments\CreateInvestmentData;
use App\Data\Investments\UpdateInvestmentData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Investments\AddInvestmentUpdateRequest;
use App\Http\Requests\Investments\StoreInvestmentRequest;
use App\Http\Requests\Investments\UpdateInvestmentRequest;
use App\Jobs\Investments\AddInvestmentUpdate;
use App\Jobs\Investments\CreateInvestment;
use App\Jobs\Investments\DeleteInvestment;
use App\Jobs\Investments\UpdateInvestment;
use App\Models\Investment;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InvestmentController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        return Inertia::render('investments/index', [
            'investments' => $user->investments()->with(['account', 'updates' => fn ($q) => $q->orderByDesc('date')->limit(5)])->orderBy('name')->get(),
            'accounts' => $user->accounts()->where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function store(StoreInvestmentRequest $request): RedirectResponse
    {
        CreateInvestment::dispatch(user: $request->user(), data: CreateInvestmentData::from($request->validated()));

        return redirect()->back()->with('success', 'Investment created.');
    }

    public function update(UpdateInvestmentRequest $request, Investment $investment): RedirectResponse
    {
        UpdateInvestment::dispatch(user: $request->user(), investment: $investment, data: UpdateInvestmentData::from($request->validated()));

        return redirect()->back()->with('success', 'Investment updated.');
    }

    public function destroy(Investment $investment): RedirectResponse
    {
        abort_if($investment->user_id !== auth()->id(), 403);

        DeleteInvestment::dispatch(user: auth()->user(), investment: $investment);

        return redirect()->back()->with('success', 'Investment deleted.');
    }

    public function addUpdate(AddInvestmentUpdateRequest $request, Investment $investment): RedirectResponse
    {
        AddInvestmentUpdate::dispatch(user: $request->user(), investment: $investment, data: AddInvestmentUpdateData::from($request->validated()));

        return redirect()->back()->with('success', 'Investment value updated.');
    }
}
