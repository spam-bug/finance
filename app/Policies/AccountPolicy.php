<?php

namespace App\Policies;

use App\Models\Account;
use App\Models\User;

class AccountPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Account $account): bool
    {
        return $user->id === $account->user_id;
    }

    public function create(User $user): bool
    {
        return $user->canEdit();
    }

    public function update(User $user, Account $account): bool
    {
        return $user->id === $account->user_id && $user->canEdit();
    }

    public function delete(User $user, Account $account): bool
    {
        return $user->id === $account->user_id && $user->canEdit();
    }
}
