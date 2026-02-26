import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { type SavingsGoal } from '@/types';
import { router, useForm } from '@inertiajs/react';
import { PlusCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function AddContributionDialog({ goal }: { goal: SavingsGoal }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ amount: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const newAmount = Number(goal.current_amount) + Number(form.data.amount);
        toast.info('Processing request...');
        setOpen(false);
        form.reset();
        router.put(`/savings/${goal.id}`, {
            name: goal.name,
            target_amount: goal.target_amount,
            current_amount: String(newAmount),
            target_date: goal.target_date ?? '',
            account_id: goal.account_id,
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full h-8"><PlusCircleIcon className="mr-1 h-3.5 w-3.5" />Add Contribution</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Add to {goal.name}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount to add</Label>
                        <CurrencyInput id="amount" min="0.01" step="0.01" value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} placeholder="0.00" autoFocus />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : 'Add'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
