<?php

namespace App\Jobs\Invitations;

use App\Events\Invitations\InvitationAccepted;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AcceptInvitation implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Invitation $invitation,
        public string $name,
        public string $password,
    ) {}

    public function handle(DatabaseManager $database): void
    {
        try {
            $inviter = $this->invitation->invitedBy;

            $newUser = $database->transaction(function () {
                $user = User::query()->create([
                    'name' => $this->name,
                    'email' => $this->invitation->email,
                    'password' => Hash::make($this->password),
                    'permission' => $this->invitation->permission,
                    'invited_by' => $this->invitation->invited_by,
                ]);

                $this->invitation->update(['accepted_at' => now()]);

                return $user;
            });

            broadcast(new InvitationAccepted(
                inviter: $inviter,
                newUser: $newUser,
                invitation: $this->invitation,
            ));
        } catch (\Throwable $exception) {
            Log::error('Failed to accept invitation', [
                'invitation' => $this->invitation->id,
                'error' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
            ]);

            throw $exception;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Invitation acceptance failed after all retries', [
            'invitation' => $this->invitation->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
