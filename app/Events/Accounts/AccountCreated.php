<?php

namespace App\Events\Accounts;

use App\Models\Account;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AccountCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public Account $account,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('accounts.'.$this->user->id),
        ];
    }

    public function broadcastWith(): array
    {
        return ['message' => 'Accounts has been created.'];
    }

    public function broadcastAs(): string
    {
        return 'accounts.created';
    }
}
