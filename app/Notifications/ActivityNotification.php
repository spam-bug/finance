<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class ActivityNotification extends Notification
{
    public function __construct(
        public string $message,
        public string $type,
    ) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /** @return array<string, mixed> */
    public function toDatabase(object $notifiable): array
    {
        return [
            'message' => $this->message,
            'type' => $this->type,
        ];
    }
}
