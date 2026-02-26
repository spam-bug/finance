import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { router, usePage } from '@inertiajs/react';
import { BellIcon } from 'lucide-react';
import { useState } from 'react';

type AppNotification = {
    id: string;
    message: string;
    type: string;
    read_at: string | null;
    created_at: string;
};

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export function NotificationBell() {
    const { notifications } = usePage<{
        notifications: { unread_count: number; items: AppNotification[] } | null;
    }>().props;
    const [open, setOpen] = useState(false);

    if (!notifications) return null;

    const { unread_count, items } = notifications;

    function handleMarkAllRead() {
        router.post('/notifications/read-all', {}, { preserveScroll: true, only: ['notifications'] });
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <BellIcon className="h-4 w-4" />
                    {unread_count > 0 && (
                        <span className="bg-primary text-primary-foreground absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium">
                            {unread_count > 9 ? '9+' : unread_count}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h3 className="text-sm font-medium">Notifications</h3>
                    {unread_count > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto py-0 text-xs" onClick={handleMarkAllRead}>
                            Mark all as read
                        </Button>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-1 py-8 text-center">
                            <BellIcon className="text-muted-foreground h-8 w-8" />
                            <p className="text-muted-foreground text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        items.map((n) => (
                            <div
                                key={n.id}
                                className={`border-b px-4 py-3 last:border-b-0 ${!n.read_at ? 'bg-primary/5' : ''}`}
                            >
                                <p className="text-sm">{n.message}</p>
                                <p className="text-muted-foreground mt-0.5 text-xs">{formatRelativeTime(n.created_at)}</p>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
