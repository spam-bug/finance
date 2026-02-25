<?php

namespace App\Http\Controllers\Credits;

use App\Data\Credits\CreateCreditData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Credits\PayCreditPaymentRequest;
use App\Http\Requests\Credits\StoreCreditRequest;
use App\Jobs\Credits\CreateCredit;
use App\Jobs\Credits\DeleteCredit;
use App\Jobs\Credits\PayCreditPayment;
use App\Models\Credit;
use App\Models\CreditPayment;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CreditController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        return Inertia::render('credits/index', [
            'credits' => $user->credits()
                ->with(['payments' => fn ($q) => $q->orderBy('due_date')])
                ->orderByDesc('created_at')
                ->get(),
            'accounts' => $user->accounts()->where('is_active', true)->orderBy('name')->get(),
        ]);
    }

    public function store(StoreCreditRequest $request): RedirectResponse
    {
        CreateCredit::dispatch(
            user: $request->user(),
            data: CreateCreditData::from($request->validated()),
        );

        return redirect()->back()->with('success', 'Credit added.');
    }

    public function destroy(Credit $credit): RedirectResponse
    {
        $this->authorize('delete', $credit);

        DeleteCredit::dispatch(
            user: auth()->user(),
            credit: $credit,
        );

        return redirect()->back()->with('success', 'Credit deleted.');
    }

    public function payPayment(PayCreditPaymentRequest $request, CreditPayment $payment): RedirectResponse
    {
        if ($payment->isPaid()) {
            return redirect()->back()->with('error', 'This payment is already paid.');
        }

        PayCreditPayment::dispatch(
            user: $request->user(),
            payment: $payment->load('credit'),
            accountId: $request->validated('account_id'),
        );

        return redirect()->back()->with('success', 'Payment recorded.');
    }
}
