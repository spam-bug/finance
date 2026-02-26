import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEcho } from '@laravel/echo-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { type Account, type Credit, type CreditPayment } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, CreditCardIcon, InfinityIcon, MoreHorizontal, PlusIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';

type Props = { credits: Credit[]; accounts: Account[] };

function formatCurrency(amount: string | number): string {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount));
}

function formatDate(date: string): string {
    return new Date(date.split('T')[0] + 'T00:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function CreditForm({ onClose }: { onClose: () => void }) {
    const form = useForm({
        name: '',
        is_indefinite: false,
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
        router.post('/credits', payload, { onSuccess: onClose });
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
                    <Select value={form.data.payment_frequency} onValueChange={(v) => form.setData('payment_frequency', v)}>
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

function PaymentRow({ payment, accounts }: { payment: CreditPayment; accounts: Account[] }) {
    const [isPaying, setIsPaying] = useState(false);
    const form = useForm({ account_id: accounts[0] ? String(accounts[0].id) : '' });

    function handlePay(e: React.FormEvent) {
        e.preventDefault();
        router.post(`/credit-payments/${payment.id}/pay`, { account_id: Number(form.data.account_id) }, { onSuccess: () => setIsPaying(false) });
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

function CreditCard({ credit, accounts, onDelete }: { credit: Credit & { is_indefinite?: boolean }; accounts: Account[]; onDelete: () => void }) {
    const [expanded, setExpanded] = useState(false);
    const payments = credit.payments ?? [];
    const paidCount = payments.filter((p) => p.paid_at).length;
    const paidAmount = payments.filter((p) => p.paid_at).reduce((sum, p) => sum + Number(p.amount), 0);
    const progress = payments.length > 0 ? (paidCount / payments.length) * 100 : 0;
    const remaining = credit.is_indefinite ? null : Number(credit.total_amount) - paidAmount;

    const nextGenerationHint = (() => {
        if (!credit.is_indefinite) return null;
        const unpaid = payments.filter((p) => !p.paid_at).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        if (unpaid.length === 0) return 'A new payment will be generated automatically.';
        return `Next payment generates after ${formatDate(unpaid[0].due_date)} is paid.`;
    })();

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{credit.name}</CardTitle>
                        {credit.is_indefinite && <Badge variant="secondary" className="flex items-center gap-1"><InfinityIcon className="h-3 w-3" />Indefinite</Badge>}
                    </div>
                    <p className="text-muted-foreground text-sm capitalize">{credit.payment_frequency} · {credit.is_indefinite ? `${paidCount} paid` : `${payments.length} payments`}</p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onDelete} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-3">
                {credit.is_indefinite ? (
                    <>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Paid</span>
                            <span className="font-semibold">{formatCurrency(paidAmount)}</span>
                        </div>
                        {nextGenerationHint && <p className="text-muted-foreground text-xs">{nextGenerationHint}</p>}
                    </>
                ) : (
                    <>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Remaining</span>
                            <span className="font-semibold">{formatCurrency(remaining ?? 0)}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted">
                            <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-muted-foreground text-xs">{paidCount} of {payments.length} paid</p>
                    </>
                )}

                <Button variant="ghost" size="sm" className="w-full" onClick={() => setExpanded(!expanded)}>
                    {expanded ? 'Hide payments' : 'View payment schedule'}
                </Button>

                {expanded && (
                    <div className="space-y-2 pt-1">
                        {payments.map((payment) => (
                            <PaymentRow key={payment.id} payment={payment} accounts={accounts} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function CreditsIndex({ credits, accounts }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deleting, setDeleting] = useState<Credit | null>(null);

    useEcho(`credits.${auth.user.id}`, ['.credits.created', '.credits.deleted', '.credits.payment-paid'], () => router.reload({ only: ['credits'] }));

    function handleDelete(credit: Credit) {
        setDeleting(credit);
    }

    function confirmDelete() {
        if (!deleting) return;
        router.delete(`/credits/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Credits</h1>
                    <p className="text-muted-foreground text-sm">Track loans and payment schedules.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusIcon className="mr-2 h-4 w-4" />Add Credit</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>New Credit</DialogTitle></DialogHeader>
                        <CreditForm onClose={() => setIsCreateOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            {credits.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {credits.map((credit) => (
                        <CreditCard key={credit.id} credit={credit} accounts={accounts} onDelete={() => handleDelete(credit)} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <CreditCardIcon className="text-muted-foreground h-12 w-12" />
                    <div>
                        <p className="font-medium">No credits yet</p>
                        <p className="text-muted-foreground text-sm">Add a loan or credit to track payments.</p>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={Boolean(deleting)}
                description={`Delete "${deleting?.name}"? All payment records will be removed.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleting(null)}
            />
        </div>
    );
}

CreditsIndex.layout = (page: ReactNode) => <AppLayout breadcrumb="Credits">{page}</AppLayout>;
