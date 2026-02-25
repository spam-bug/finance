<?php

use App\Http\Controllers\Accounts\AccountController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Budgets\BudgetController;
use App\Http\Controllers\Credits\CreditController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Goals\GoalController;
use App\Http\Controllers\Investments\InvestmentController;
use App\Http\Controllers\Profile\ProfileController;
use App\Http\Controllers\Savings\SavingsGoalController;
use App\Http\Controllers\Transactions\TransactionController;
use Illuminate\Support\Facades\Route;

// Guest routes
Route::middleware('guest')->group(function (): void {
    Route::get('login', [LoginController::class, 'create'])->name('login');
    Route::post('login', [LoginController::class, 'store']);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.store');
});

// Authenticated routes
Route::middleware('auth')->group(function (): void {
    Route::get('/', [DashboardController::class, '__invoke'])->name('dashboard');

    Route::post('logout', [LoginController::class, 'destroy'])->name('logout');

    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');

    // Accounts
    Route::resource('accounts', AccountController::class)->except(['create', 'edit', 'show']);

    // Transactions
    Route::get('transactions/income', [TransactionController::class, 'income'])->name('transactions.income');
    Route::get('transactions/expenses', [TransactionController::class, 'expenses'])->name('transactions.expenses');
    Route::post('transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::put('transactions/{transaction}', [TransactionController::class, 'update'])->name('transactions.update');
    Route::delete('transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');

    // Credits
    Route::resource('credits', CreditController::class)->except(['create', 'edit', 'show', 'update']);
    Route::post('credit-payments/{payment}/pay', [CreditController::class, 'payPayment'])->name('credit-payments.pay');

    // Savings Goals
    Route::resource('savings', SavingsGoalController::class)->except(['create', 'edit', 'show'])->parameters(['savings' => 'savings_goal']);

    // Investments
    Route::resource('investments', InvestmentController::class)->except(['create', 'edit', 'show']);
    Route::post('investments/{investment}/updates', [InvestmentController::class, 'addUpdate'])->name('investments.updates.store');

    // Budgets
    Route::resource('budgets', BudgetController::class)->except(['create', 'edit', 'show', 'update']);

    // Goals
    Route::resource('goals', GoalController::class)->except(['create', 'edit', 'show']);
});
