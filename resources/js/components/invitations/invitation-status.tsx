import { Badge } from '@/components/ui/badge';

type Invitation = {
    id: number;
    email: string;
    permission: 'edit' | 'view_only';
    accepted_at: string | null;
    expires_at: string;
    created_at: string;
};

export function InvitationStatus({ invitation }: { invitation: Invitation }) {
    if (invitation.accepted_at) {
        return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Accepted</Badge>;
    }
    if (new Date(invitation.expires_at) < new Date()) {
        return <Badge variant="secondary" className="text-muted-foreground">Expired</Badge>;
    }
    return <Badge variant="outline" className="text-amber-600 dark:text-amber-400">Pending</Badge>;
}
