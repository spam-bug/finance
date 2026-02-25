<?php

namespace App\Http\Controllers\Transactions;

use App\Data\Transactions\CreateTransactionData;
use App\Data\Transactions\UpdateTransactionData;
use App\Enums\CategoryType;
use App\Enums\TransactionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Transactions\StoreTransactionRequest;
use App\Http\Requests\Transactions\UpdateTransactionRequest;
use App\Jobs\Transactions\CreateTransaction;
use App\Jobs\Transactions\DeleteTransaction;
use App\Jobs\Transactions\UpdateTransaction;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function income(): Response
    {
        $user = auth()->user();

        return Inertia::render('transactions/income', [
            'transactions' => $user->transactions()
                ->where('type', TransactionType::Income)
                ->with(['account', 'category.parent'])
                ->orderByDesc('date')
                ->orderByDesc('id')
                ->get(),
            'accounts' => $user->accounts()->where('is_active', true)->orderBy('name')->get(),
            'categories' => $user->categories()
                ->whereIn('type', [CategoryType::Income->value, CategoryType::Both->value])
                ->with('parent')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function expenses(): Response
    {
        $user = auth()->user();

        return Inertia::render('transactions/expenses', [
            'transactions' => $user->transactions()
                ->where('type', TransactionType::Expense)
                ->with(['account', 'category.parent'])
                ->orderByDesc('date')
                ->orderByDesc('id')
                ->get(),
            'accounts' => $user->accounts()->where('is_active', true)->orderBy('name')->get(),
            'categories' => $user->categories()
                ->whereIn('type', [CategoryType::Expense->value, CategoryType::Both->value])
                ->with('parent')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        CreateTransaction::dispatch(
            user: $request->user(),
            data: CreateTransactionData::from($request->validated()),
        );

        return redirect()->back()->with('success', 'Transaction added.');
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): RedirectResponse
    {
        UpdateTransaction::dispatch(
            user: $request->user(),
            transaction: $transaction,
            data: UpdateTransactionData::from($request->validated()),
        );

        return redirect()->back()->with('success', 'Transaction updated.');
    }

    public function destroy(Transaction $transaction): RedirectResponse
    {
        $this->authorize('delete', $transaction);

        DeleteTransaction::dispatch(
            user: auth()->user(),
            transaction: $transaction->load('account'),
        );

        return redirect()->back()->with('success', 'Transaction deleted.');
    }
}
