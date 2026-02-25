<?php

namespace App\Policies;

use App\Models\Credit;
use App\Models\User;

class CreditPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->canEdit();
    }

    public function delete(User $user, Credit $credit): bool
    {
        return $user->id === $credit->user_id && $user->canEdit();
    }
}
