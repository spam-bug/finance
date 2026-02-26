import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { MailIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function SendInviteDialog() {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        permission: 'edit' as 'edit' | 'view_only',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        toast.loading('Processing...', { id: 'form-processing' });
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
