<?php

namespace App\Jobs\Invitations;

use App\Data\Invitations\CreateInvitationData;
use App\Events\Invitations\InvitationSent;
use App\Mail\InvitationMail;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class SendInvitation implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $user,
        public CreateInvitationData $data,
    ) {}

    public function handle(DatabaseManager $database): void
    {
        try {
            $invitation = $database->transaction(
                callback: fn () => Invitation::query()->create([
                    'invited_by' => $this->user->id,
                    'email' => $this->data->email,
                    'token' => Str::random(64),
                    'permission' => $this->data->permission,
                    'expires_at' => now()->addDays(7),
                ])
            );

            Mail::to($invitation->email)->send(new InvitationMail($invitation));

            broadcast(new InvitationSent(user: $this->user, invitation: $invitation));
        } catch (\Throwable $exception) {
            Log::error('Failed to send invitation', [
                'user' => $this->user->id,
                'email' => $this->data->email,
                'error' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
            ]);

            throw $exception;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('Invitation sending failed after all retries', [
            'user' => $this->user->id,
            'data' => $this->data,
            'error' => $exception->getMessage(),
        ]);
    }
}
