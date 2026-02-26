<?php

namespace App\Jobs\Categories;

use App\Events\Categories\CategoryCreated;
use App\Models\Category;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CreateCategory implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array<string, mixed>  $data
     */
    public function __construct(
        public User $user,
        public array $data,
    ) {}

    public function handle(DatabaseManager $database): void
    {
        $category = $database->transaction(
            fn () => Category::query()->create($this->data)
        );

        broadcast(new CategoryCreated(user: $this->user, category: $category));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Category creation failed', ['user' => $this->user->id, 'error' => $exception->getMessage()]);
    }
}
