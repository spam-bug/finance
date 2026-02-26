import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/format';
import { router, useForm } from '@inertiajs/react';
import { toast } from 'sonner';

export function CreditForm({ onClose }: { onClose: () => void }) {
    const form = useForm({
        name: '',
        is_indefinite: false,
        divide_into_monthly: false,
        total_amount: '',
        payment_frequency: 'monthly',
        number_of_payments: '12',
        amount_per_payment: '',
        start_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const computedPerPayment = !form.data.is_indefinite && form.data.total_amount && form.data.number_of_payments
        ? Number(form.data.total_amount) / Number(form.data.number_of_payments)
        : null;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload: Record<string, unknown> = {
            name: form.data.name,
            is_indefinite: form.data.is_indefinite,
            divide_into_monthly: form.data.payment_frequency === 'quarterly' && !form.data.is_indefinite ? form.data.divide_into_monthly : false,
            payment_frequency: form.data.payment_frequency,
            start_date: form.data.start_date,
            notes: form.data.notes,
        };
        if (form.data.is_indefinite) {
            payload.amount_per_payment = form.data.amount_per_payment;
        } else {
            payload.total_amount = form.data.total_amount;
            payload.number_of_payments = form.data.number_of_payments;
            payload.amount_per_payment = computedPerPayment ?? form.data.amount_per_payment;
        }
        toast.loading('Processing...');
        onClose();
        router.post('/credits', payload);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Car Loan" />
                {form.errors.name && <p className="text-destructive text-sm">{form.errors.name}</p>}
            </div>

            <div className="flex items-center gap-2">
                <input
                    id="is_indefinite"
                    type="checkbox"
                    checked={form.data.is_indefinite}
                    onChange={(e) => form.setData('is_indefinite', e.target.checked)}
                    className="h-4 w-4 rounded border"
                />
                <Label htmlFor="is_indefinite">Indefinite (ongoing, no fixed end)</Label>
            </div>

            {form.data.is_indefinite ? (
                <div className="space-y-2">
                    <Label htmlFor="amount_per_payment">Amount per Payment</Label>
                    <CurrencyInput id="amount_per_payment" min="0.01" step="0.01" value={form.data.amount_per_payment} onChange={(e) => form.setData('amount_per_payment', e.target.value)} />
                    {form.errors.amount_per_payment && <p className="text-destructive text-sm">{form.errors.amount_per_payment}</p>}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="total_amount">Total Amount</Label>
                            <CurrencyInput id="total_amount" min="0.01" step="0.01" value={form.data.total_amount} onChange={(e) => form.setData('total_amount', e.target.value)} />
                            {form.errors.total_amount && <p className="text-destructive text-sm">{form.errors.total_amount}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="number_of_payments">Number of Payments</Label>
                            <Input id="number_of_payments" type="number" min="1" max="360" value={form.data.number_of_payments} onChange={(e) => form.setData('number_of_payments', e.target.value)} />
                            {form.errors.number_of_payments && <p className="text-destructive text-sm">{form.errors.number_of_payments}</p>}
                        </div>
                    </div>
                    {computedPerPayment !== null && (
                        <p className="text-muted-foreground text-sm">Per payment: <strong>{formatCurrency(computedPerPayment)}</strong></p>
                    )}
                </>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="payment_frequency">Frequency</Label>
                    <Select value={form.data.payment_frequency} onValueChange={(v) => { form.setData('payment_frequency', v); if (v !== 'quarterly') form.setData('divide_into_monthly', false); }}>
                        <SelectTrigger id="payment_frequency"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input id="start_date" type="date" value={form.data.start_date} onChange={(e) => form.setData('start_date', e.target.value)} />
                </div>
            </div>

            {form.data.payment_frequency === 'quarterly' && !form.data.is_indefinite && (
                <div className="flex items-center gap-2">
                    <input
                        id="divide_into_monthly"
                        type="checkbox"
                        checked={form.data.divide_into_monthly}
                        onChange={(e) => form.setData('divide_into_monthly', e.target.checked)}
                        className="h-4 w-4 rounded border"
                    />
                    <Label htmlFor="divide_into_monthly">Divide each quarterly payment into 3 monthly payments</Label>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} rows={2} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : 'Add Credit'}</Button>
            </div>
        </form>
    );
}
