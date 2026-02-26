import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InvitationStatus } from '@/components/invitations/invitation-status';
import { SendInviteDialog } from '@/components/invitations/send-invite-dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { formatDate } from '@/lib/format';
import AppLayout from '@/layouts/app-layout';
import { router, usePage } from '@inertiajs/react';
import { Trash2Icon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

type Invitation = {
    id: number;
    email: string;
    permission: 'edit' | 'view_only';
    accepted_at: string | null;
    expires_at: string;
    created_at: string;
};

type Props = {
    invitations: Invitation[];
};

export default function InvitationsIndex({ invitations }: Props) {
    const { auth } = usePage<{ auth: { user: { permission: string } } }>().props;
    const canEdit = auth.user.permission === 'edit';
    const [revoking, setRevoking] = useState<number | null>(null);

    function handleRevoke(id: number) {
        setRevoking(id);
    }

    function confirmRevoke() {
        if (revoking === null) return;
        toast.info('Processing request...');
        router.delete(`/invitations/${revoking}`, { onFinish: () => setRevoking(null) });
    }

    const pending = invitations.filter((i) => !i.accepted_at && new Date(i.expires_at) >= new Date());
    const others = invitations.filter((i) => i.accepted_at || new Date(i.expires_at) < new Date());

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Invitations</h1>
                    <p className="text-muted-foreground text-sm">Manage access to your Finance Tracker</p>
                </div>
                {canEdit && <SendInviteDialog />}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Sent Invitations</CardTitle>
                </CardHeader>
                <CardContent>
                    {invitations.length === 0 ? (
                        <div className="text-muted-foreground py-8 text-center text-sm">
                            No invitations sent yet. Invite someone to share access.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Permission</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sent</TableHead>
                                    <TableHead>Expires</TableHead>
                                    {canEdit && <TableHead className="w-12" />}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...pending, ...others].map((invitation) => {
                                    const isPending = !invitation.accepted_at && new Date(invitation.expires_at) >= new Date();
                                    return (
                                        <TableRow key={invitation.id}>
                                            <TableCell className="font-medium">{invitation.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {invitation.permission === 'edit' ? 'Edit' : 'View only'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell><InvitationStatus invitation={invitation} /></TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{formatDate(invitation.created_at)}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{formatDate(invitation.expires_at)}</TableCell>
                                            {canEdit && (
                                                <TableCell>
                                                    {isPending && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-muted-foreground hover:text-destructive h-8 w-8"
                                                            onClick={() => handleRevoke(invitation.id)}
                                                        >
                                                            <Trash2Icon className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog
                open={revoking !== null}
                title="Revoke invitation?"
                description="The invitation link will be invalidated and the recipient will no longer be able to accept it."
                confirmLabel="Revoke"
                onConfirm={confirmRevoke}
                onCancel={() => setRevoking(null)}
            />
        </div>
    );
}

InvitationsIndex.layout = (page: ReactNode) => <AppLayout breadcrumb="Invitations">{page}</AppLayout>;
