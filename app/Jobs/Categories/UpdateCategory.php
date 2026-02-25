<?php

namespace App\Jobs\Categories;

use App\Events\Categories\CategoryUpdated;
use App\Models\Category;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class UpdateCategory implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array<string, mixed>  $data
     */
    public function __construct(
        public User $user,
        public Category $category,
        public array $data,
    ) {}

    public function handle(DatabaseManager $database): void
    {
        $database->transaction(fn () => $this->category->update($this->data));

        broadcast(new CategoryUpdated(user: $this->user, category: $this->category->fresh()));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Category update failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
