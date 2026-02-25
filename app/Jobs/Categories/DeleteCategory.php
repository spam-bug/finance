<?php

namespace App\Jobs\Categories;

use App\Events\Categories\CategoryDeleted;
use App\Models\Category;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class DeleteCategory implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $user,
        public Category $category,
    ) {}

    public function handle(DatabaseManager $database): void
    {
        $categoryId = $this->category->id;

        $database->transaction(fn () => $this->category->delete());

        broadcast(new CategoryDeleted(user: $this->user, categoryId: $categoryId));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Category deletion failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
