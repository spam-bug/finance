import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

export function CreateUserForm({ onClose }: { onClose: () => void }) {
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
        form.post('/users', { onSuccess: () => onClose() });
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
