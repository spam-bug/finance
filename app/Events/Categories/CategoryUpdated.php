<?php

namespace App\Events\Categories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CategoryUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Category $category,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('categories.'.$this->user->id),
        ];
    }

    public function broadcastWith(): array
    {
        return ['message' => 'Category has been updated.'];
    }

    public function broadcastAs(): string
    {
        return 'categories.updated';
    }
}
