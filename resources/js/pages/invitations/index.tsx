import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { router, useForm, usePage } from '@inertiajs/react';
import { MailIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { type ReactNode, useState } from 'react';

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

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function InvitationStatus({ invitation }: { invitation: Invitation }) {
    if (invitation.accepted_at) {
        return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Accepted</Badge>;
    }
    if (new Date(invitation.expires_at) < new Date()) {
        return <Badge variant="secondary" className="text-muted-foreground">Expired</Badge>;
    }
    return <Badge variant="outline" className="text-amber-600 dark:text-amber-400">Pending</Badge>;
}

function SendInviteDialog() {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        permission: 'edit' as 'edit' | 'view_only',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/invitations', {
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><PlusIcon className="mr-1 h-4 w-4" />Invite User</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send Invitation</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="colleague@example.com"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            autoFocus
                        />
                        {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="permission">Permission level</Label>
                        <Select value={data.permission} onValueChange={(v) => setData('permission', v as 'edit' | 'view_only')}>
                            <SelectTrigger id="permission">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="edit">Edit — can add and manage data</SelectItem>
                                <SelectItem value="view_only">View only — can only view data</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.permission && <p className="text-destructive text-sm">{errors.permission}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            <MailIcon className="mr-1 h-4 w-4" />
                            {processing ? 'Sending…' : 'Send Invite'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function InvitationsIndex({ invitations }: Props) {
    const { auth } = usePage<{ auth: { user: { permission: string } } }>().props;
    const canEdit = auth.user.permission === 'edit';
    const [revoking, setRevoking] = useState<number | null>(null);

    function handleRevoke(id: number) {
        setRevoking(id);
    }

    function confirmRevoke() {
        if (revoking === null) return;
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
