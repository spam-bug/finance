<?php

namespace App\Http\Controllers\Accounts;

use App\Data\Accounts\CreateAccountData;
use App\Data\Accounts\UpdateAccountData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Accounts\StoreAccountRequest;
use App\Http\Requests\Accounts\UpdateAccountRequest;
use App\Jobs\Accounts\CreateAccount;
use App\Jobs\Accounts\DeleteAccount;
use App\Jobs\Accounts\UpdateAccount;
use App\Models\Account;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(): Response
    {
        $accounts = auth()->user()
            ->accounts()
            ->orderBy('name')
            ->get();

        return Inertia::render('accounts/index', [
            'accounts' => $accounts,
        ]);
    }

    public function store(StoreAccountRequest $request): RedirectResponse
    {
        CreateAccount::dispatch(
            user: $request->user(),
            data: CreateAccountData::from($request->validated()),
        );

        return redirect()->back()->with('success', 'Account created.');
    }

    public function update(UpdateAccountRequest $request, Account $account): RedirectResponse
    {
        UpdateAccount::dispatch(
            user: $request->user(),
            account: $account,
            data: UpdateAccountData::from($request->validated()),
        );

        return redirect()->back()->with('success', 'Account updated.');
    }

    public function destroy(Account $account): RedirectResponse
    {
        $this->authorize('delete', $account);

        DeleteAccount::dispatch(
            user: auth()->user(),
            account: $account,
        );

        return redirect()->back()->with('success', 'Account deleted.');
    }
}
