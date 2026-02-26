import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/format';
import { type Account, type CreditPayment } from '@/types';
import { router, useForm } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function PaymentRow({ payment, accounts }: { payment: CreditPayment; accounts: Account[] }) {
    const [isPaying, setIsPaying] = useState(false);
    const form = useForm({ account_id: accounts[0] ? String(accounts[0].id) : '' });

    function handlePay(e: React.FormEvent) {
        e.preventDefault();
        toast.loading('Processing...');
        setIsPaying(false);
        router.post(`/credit-payments/${payment.id}/pay`, { account_id: Number(form.data.account_id) });
    }

    if (payment.paid_at) {
        return (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">{formatDate(payment.due_date)}</span>
                </div>
                <span className="font-medium text-green-600">{formatCurrency(payment.amount)}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
            <div>
                <span className="text-muted-foreground">{formatDate(payment.due_date)}</span>
                <span className="ml-2 font-medium">{formatCurrency(payment.amount)}</span>
            </div>
            {isPaying ? (
                <form onSubmit={handlePay} className="flex items-center gap-2">
                    <Select value={form.data.account_id} onValueChange={(v) => form.setData('account_id', v)}>
                        <SelectTrigger className="h-7 w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {accounts.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button type="submit" size="sm" className="h-7">Pay</Button>
                    <Button type="button" size="sm" variant="ghost" className="h-7" onClick={() => setIsPaying(false)}>Cancel</Button>
                </form>
            ) : (
                <Button size="sm" variant="outline" className="h-7" onClick={() => setIsPaying(true)}>Mark paid</Button>
            )}
        </div>
    );
}
