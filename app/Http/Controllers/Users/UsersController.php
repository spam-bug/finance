<?php

namespace App\Http\Controllers\Users;

use App\Data\Users\CreateUserData;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Jobs\Users\CreateUser;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UsersController extends Controller
{
    public function index(): Response
    {
        abort_if(! auth()->user()->canEdit(), 403);

        $users = User::query()
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'permission', 'created_at', 'invited_by']);

        return Inertia::render('users/index', [
            'users' => $users,
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        CreateUser::dispatch(
            createdBy: $request->user(),
            data: CreateUserData::from($request->validated()),
        );

        return redirect()->back()->with('success', 'User created.');
    }
}
