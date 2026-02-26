<?php

namespace App\Http\Controllers\Notifications;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class NotificationsController extends Controller
{
    public function markRead(string $id): RedirectResponse
    {
        auth()->user()->notifications()->find($id)?->markAsRead();

        return redirect()->back();
    }

    public function markAllRead(): RedirectResponse
    {
        auth()->user()->unreadNotifications()->update(['read_at' => now()]);

        return redirect()->back();
    }
}
