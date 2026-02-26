<?php

use App\Http\Controllers\Accounts\AccountController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Budgets\BudgetController;
use App\Http\Controllers\Categories\CategoryController;
use App\Http\Controllers\Credits\CreditController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Goals\GoalController;
use App\Http\Controllers\Investments\InvestmentController;
use App\Http\Controllers\Invitations\InvitationController;
use App\Http\Controllers\Notifications\NotificationsController;
use App\Http\Controllers\Profile\ProfileController;
use App\Http\Controllers\Savings\SavingsGoalController;
use App\Http\Controllers\Transactions\TransactionController;
use App\Http\Controllers\Users\UsersController;
use Illuminate\Support\Facades\Route;

// Guest routes
Route::middleware('guest')->group(function (): void {
    Route::get('login', [LoginController::class, 'create'])->name('login');
    Route::post('login', [LoginController::class, 'store']);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.store');

    // Accept invitation
    Route::get('register/{token}', [InvitationController::class, 'showAccept'])->name('invitations.accept.show');
    Route::post('register/{token}', [InvitationController::class, 'accept'])->name('invitations.accept');
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

    // Categories
    Route::resource('categories', CategoryController::class)->except(['create', 'edit', 'show']);

    // Invitations
    Route::get('invitations', [InvitationController::class, 'index'])->name('invitations.index');
    Route::post('invitations', [InvitationController::class, 'store'])->name('invitations.store');
    Route::delete('invitations/{invitation}', [InvitationController::class, 'destroy'])->name('invitations.destroy');

    // Users
    Route::get('users', [UsersController::class, 'index'])->name('users.index');
    Route::post('users', [UsersController::class, 'store'])->name('users.store');

    // Notifications
    Route::post('notifications/{id}/read', [NotificationsController::class, 'markRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationsController::class, 'markAllRead'])->name('notifications.read-all');
});
