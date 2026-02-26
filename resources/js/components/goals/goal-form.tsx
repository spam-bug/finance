import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type Account, type Goal } from '@/types';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

type GoalFormProps = { goal?: Goal; accounts: Account[]; onClose: () => void };

export function GoalForm({ goal, accounts, onClose }: GoalFormProps) {
    const isEditing = Boolean(goal);
    const form = useForm({
        name: goal?.name ?? '',
        target_amount: goal?.target_amount ?? '',
        current_amount: goal?.current_amount ?? '0',
        target_date: goal?.target_date ? goal.target_date.split('T')[0] : '',
        account_id: goal?.account_id ? String(goal.account_id) : '',
        notes: goal?.notes ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        toast.loading('Processing...');
        if (isEditing && goal) {
            form.transform((data) => ({
                ...data,
                account_id: data.account_id ? Number(data.account_id) : null,
            })).put(`/goals/${goal.id}`, { onSuccess: () => onClose() });
        } else {
            form.transform((data) => ({
                ...data,
                account_id: data.account_id ? Number(data.account_id) : null,
            })).post('/goals', { onSuccess: () => onClose() });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Buy a car" />
                {form.errors.name && <p className="text-destructive text-sm">{form.errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="target_amount">Target Amount</Label>
                    <CurrencyInput id="target_amount" min="0.01" step="0.01" value={form.data.target_amount} onChange={(e) => form.setData('target_amount', e.target.value)} />
                    {form.errors.target_amount && <p className="text-destructive text-sm">{form.errors.target_amount}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="current_amount">Current Amount</Label>
                    <CurrencyInput id="current_amount" min="0" step="0.01" value={form.data.current_amount} onChange={(e) => form.setData('current_amount', e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="target_date">Target Date</Label>
                    <Input id="target_date" type="date" value={form.data.target_date} onChange={(e) => form.setData('target_date', e.target.value)} />
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
            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : isEditing ? 'Save changes' : 'Create Goal'}</Button>
            </div>
        </form>
    );
}
