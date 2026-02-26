import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreateUserForm } from '@/components/users/create-user-form';
import { formatDate } from '@/lib/format';
import AppLayout from '@/layouts/app-layout';
import { PlusIcon, UsersIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';

type AppUser = {
    id: number;
    name: string;
    email: string;
    permission: 'edit' | 'view_only';
    created_at: string;
};

type Props = { users: AppUser[] };

const PERMISSION_LABELS: Record<string, string> = { edit: 'Edit', view_only: 'View only' };

export default function UsersIndex({ users }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
                    <p className="text-muted-foreground text-sm">Manage who has access to Finance Tracker.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusIcon className="mr-2 h-4 w-4" />Add User</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader><DialogTitle>Create User</DialogTitle></DialogHeader>
                        <CreateUserForm onClose={() => setIsCreateOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                            <UsersIcon className="text-muted-foreground h-10 w-10" />
                            <p className="text-muted-foreground text-sm">No users yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Permission</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{PERMISSION_LABELS[user.permission]}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{formatDate(user.created_at)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

UsersIndex.layout = (page: ReactNode) => <AppLayout breadcrumb="Users">{page}</AppLayout>;
