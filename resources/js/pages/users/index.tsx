import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { router, useForm } from '@inertiajs/react';
import { PlusIcon, UsersIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

type AppUser = {
    id: number;
    name: string;
    email: string;
    permission: 'edit' | 'view_only';
    created_at: string;
};

type Props = { users: AppUser[] };

const PERMISSION_LABELS: Record<string, string> = { edit: 'Edit', view_only: 'View only' };

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function CreateUserForm({ onClose }: { onClose: () => void }) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        permission: 'edit' as 'edit' | 'view_only',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        toast.loading('Processing...', { id: 'form-processing' });
        router.post('/users', form.data, { onSuccess: onClose });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Full name" autoFocus />
                {form.errors.name && <p className="text-destructive text-sm">{form.errors.name}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} placeholder="user@example.com" />
                {form.errors.email && <p className="text-destructive text-sm">{form.errors.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                    {form.errors.password && <p className="text-destructive text-sm">{form.errors.password}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <Input id="password_confirmation" type="password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="permission">Permission</Label>
                <Select value={form.data.permission} onValueChange={(v) => form.setData('permission', v as 'edit' | 'view_only')}>
                    <SelectTrigger id="permission"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="edit">Edit — can add and manage data</SelectItem>
                        <SelectItem value="view_only">View only — can only view data</SelectItem>
                    </SelectContent>
                </Select>
                {form.errors.permission && <p className="text-destructive text-sm">{form.errors.permission}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={form.processing}>{form.processing ? 'Creating…' : 'Create User'}</Button>
            </div>
        </form>
    );
}

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
