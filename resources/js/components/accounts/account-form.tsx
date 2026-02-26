import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type Account } from '@/types';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

type AccountFormProps = { account?: Account; onClose: () => void };

export function AccountForm({ account, onClose }: AccountFormProps) {
    const isEditing = Boolean(account);
    const form = useForm({
        name: account?.name ?? '',
        type: account?.type ?? 'cash',
        initial_balance: account ? account.initial_balance : '0',
        notes: account?.notes ?? '',
        is_active: account?.is_active ?? true,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        toast.loading('Processing...');
        if (isEditing && account) {
            form.put(`/accounts/${account.id}`, { onSuccess: () => onClose() });
        } else {
            form.post('/accounts', { onSuccess: () => onClose() });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Main Savings" />
                {form.errors.name && <p className="text-destructive text-sm">{form.errors.name}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={form.data.type} onValueChange={(v) => form.setData('type', v as Account['type'])}>
                    <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank">Bank</SelectItem>
                        <SelectItem value="e_wallet">E-Wallet</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                    </SelectContent>
                </Select>
                {form.errors.type && <p className="text-destructive text-sm">{form.errors.type}</p>}
            </div>
            {!isEditing && (
                <div className="space-y-2">
                    <Label htmlFor="initial_balance">Initial Balance</Label>
                    <Input id="initial_balance" type="number" min="0" step="0.01" value={form.data.initial_balance} onChange={(e) => form.setData('initial_balance', e.target.value)} />
                    {form.errors.initial_balance && <p className="text-destructive text-sm">{form.errors.initial_balance}</p>}
                </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} placeholder="Optional notes…" rows={3} />
                {form.errors.notes && <p className="text-destructive text-sm">{form.errors.notes}</p>}
            </div>
            {isEditing && (
                <div className="flex items-center gap-2">
                    <input id="is_active" type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} className="h-4 w-4 rounded border" />
                    <Label htmlFor="is_active">Active</Label>
                </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : isEditing ? 'Save changes' : 'Create account'}</Button>
            </div>
        </form>
    );
}
