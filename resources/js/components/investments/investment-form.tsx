import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type Account, type Investment } from '@/types';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

type InvestmentFormProps = { investment?: Investment; accounts: Account[]; onClose: () => void };

export function InvestmentForm({ investment, accounts, onClose }: InvestmentFormProps) {
    const isEditing = Boolean(investment);
    const form = useForm({
        name: investment?.name ?? '',
        type: investment?.type ?? 'shares',
        initial_value: investment?.initial_value ?? '',
        current_value: investment?.current_value ?? '',
        account_id: investment?.account_id ? String(investment.account_id) : '',
        notes: investment?.notes ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        toast.loading('Processing...');
        if (isEditing && investment) {
            form.transform((data) => ({
                ...data,
                account_id: data.account_id ? Number(data.account_id) : null,
            })).put(`/investments/${investment.id}`, { onSuccess: () => onClose() });
        } else {
            form.transform((data) => ({
                ...data,
                account_id: data.account_id ? Number(data.account_id) : null,
            })).post('/investments', { onSuccess: () => onClose() });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. ACME Corp Stock" />
                {form.errors.name && <p className="text-destructive text-sm">{form.errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={form.data.type} onValueChange={(v) => form.setData('type', v as Investment['type'])}>
                        <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="shares">Shares</SelectItem>
                            <SelectItem value="bonds">Bonds</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="account_id">Linked Account</Label>
                    <Select value={form.data.account_id} onValueChange={(v) => form.setData('account_id', v === '__none' ? '' : v)}>
                        <SelectTrigger id="account_id"><SelectValue placeholder="None" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__none">None</SelectItem>
                            {accounts.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {!isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="initial_value">Initial Value</Label>
                        <Input id="initial_value" type="number" min="0" step="0.01" value={form.data.initial_value} onChange={(e) => form.setData('initial_value', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="current_value">Current Value</Label>
                        <Input id="current_value" type="number" min="0" step="0.01" value={form.data.current_value} onChange={(e) => form.setData('current_value', e.target.value)} />
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="current_value">Current Value</Label>
                    <Input id="current_value" type="number" min="0" step="0.01" value={form.data.current_value} onChange={(e) => form.setData('current_value', e.target.value)} />
                </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : isEditing ? 'Save changes' : 'Add Investment'}</Button>
            </div>
        </form>
    );
}
