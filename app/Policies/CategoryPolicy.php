<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    public function update(User $user, Category $category): bool
    {
        return $user->canEdit();
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->canEdit();
    }
}
