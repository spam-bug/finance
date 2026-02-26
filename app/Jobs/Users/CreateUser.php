<?php

namespace App\Jobs\Users;

use App\Data\Users\CreateUserData;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class CreateUser implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $createdBy, public CreateUserData $data) {}

    public function handle(DatabaseManager $database): void
    {
        $database->transaction(fn () => User::query()->create([
            'name' => $this->data->name,
            'email' => $this->data->email,
            'password' => Hash::make($this->data->password),
            'permission' => $this->data->permission,
            'invited_by' => $this->createdBy->id,
        ]));
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('User creation failed', [
            'created_by' => $this->createdBy->id,
            'email' => $this->data->email,
            'error' => $exception->getMessage(),
        ]);
    }
}
