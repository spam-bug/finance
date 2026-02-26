import { CategoryCombobox } from '@/components/category-combobox';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type Account, type Category, type Transaction } from '@/types';
import { router, useForm } from '@inertiajs/react';
import { MoreHorizontal, PlusIcon, ReceiptIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type TransactionListProps = {
    transactions: Transaction[];
    accounts: Account[];
    categories: Category[];
    type: 'income' | 'expense';
    title: string;
    description: string;
};

const FREQUENCY_LABELS: Record<string, string> = {
    one_time: 'One-time',
    monthly: 'Monthly',
    bi_monthly: 'Bi-monthly',
    quarterly: 'Quarterly',
    annually: 'Annually',
};

function formatCurrency(amount: string | number): string {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount));
}

function formatDate(date: string): string {
    return new Date(date.split('T')[0] + 'T00:00:00').toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function getCategoryLabel(category: Category | undefined): string {
    if (!category) return 'Uncategorized';
    return category.parent ? `${category.parent.name} › ${category.name}` : category.name;
}

type TransactionFormProps = {
    transaction?: Transaction;
    accounts: Account[];
    categories: Category[];
    transactionType: 'income' | 'expense';
    defaultAccountId?: string;
    onClose: () => void;
};

function TransactionForm({ transaction, accounts, categories, transactionType, defaultAccountId, onClose }: TransactionFormProps) {
    const isEditing = Boolean(transaction);
    const form = useForm({
        account_id: transaction ? String(transaction.account_id) : (defaultAccountId ?? (accounts[0] ? String(accounts[0].id) : '')),
        category_id: transaction?.category_id ? String(transaction.category_id) : '',
        type: transactionType,
        amount: transaction ? transaction.amount : '',
        date: transaction ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0],
        description: transaction?.description ?? '',
        notes: transaction?.notes ?? '',
        frequency: transaction?.frequency ?? 'one_time',
        is_recurring: transaction?.is_recurring ?? false,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = {
            ...form.data,
            account_id: Number(form.data.account_id),
            category_id: form.data.category_id ? Number(form.data.category_id) : null,
        };
        toast.info('Processing request...');
        onClose();
        if (isEditing && transaction) {
            router.put(`/transactions/${transaction.id}`, payload);
        } else {
            router.post('/transactions', payload);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <CurrencyInput
                        id="amount"
                        min="0.01"
                        step="0.01"
                        value={form.data.amount}
                        onChange={(e) => form.setData('amount', e.target.value)}
                        placeholder="0.00"
                    />
                    {form.errors.amount && <p className="text-destructive text-sm">{form.errors.amount}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} />
                    {form.errors.date && <p className="text-destructive text-sm">{form.errors.date}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="account_id">Account</Label>
                <Select value={form.data.account_id} onValueChange={(v) => form.setData('account_id', v)}>
                    <SelectTrigger id="account_id"><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>
                        {accounts.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                {form.errors.account_id && <p className="text-destructive text-sm">{form.errors.account_id}</p>}
            </div>

            <div className="space-y-2">
                <Label>Category</Label>
                <CategoryCombobox categories={categories} value={form.data.category_id} onChange={(v) => form.setData('category_id', v)} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} placeholder="Brief description…" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={form.data.frequency} onValueChange={(v) => form.setData('frequency', v as Transaction['frequency'])}>
                    <SelectTrigger id="frequency"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="one_time">One-time</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="bi_monthly">Bi-monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {form.data.frequency !== 'one_time' && (
                <div className="flex items-center gap-2">
                    <input id="is_recurring" type="checkbox" checked={form.data.is_recurring} onChange={(e) => form.setData('is_recurring', e.target.checked)} className="h-4 w-4 rounded border" />
                    <Label htmlFor="is_recurring">Mark as recurring</Label>
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} placeholder="Optional notes…" rows={2} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : isEditing ? 'Save changes' : 'Add transaction'}</Button>
            </div>
        </form>
    );
}

export function TransactionList({ transactions, accounts, categories, type, title, description }: TransactionListProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [deleting, setDeleting] = useState<Transaction | null>(null);

    function handleDelete(transaction: Transaction) {
        setDeleting(transaction);
    }

    function confirmDelete() {
        if (!deleting) return;
        toast.info('Processing request...');
        router.delete(`/transactions/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground text-sm">{description}</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusIcon className="mr-2 h-4 w-4" />Add {type === 'income' ? 'Income' : 'Expense'}</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>New {type === 'income' ? 'Income' : 'Expense'}</DialogTitle></DialogHeader>
                        <TransactionForm accounts={accounts} categories={categories} transactionType={type} onClose={() => setIsCreateOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <p className="text-muted-foreground text-sm">Total {type === 'income' ? 'Income' : 'Expenses'}</p>
                    <CardTitle className={`text-3xl ${type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(totalAmount)}
                    </CardTitle>
                </CardHeader>
            </Card>

            {transactions.length > 0 ? (
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium">Date</th>
                                <th className="px-4 py-3 text-left font-medium">Description</th>
                                <th className="px-4 py-3 text-left font-medium">Category</th>
                                <th className="px-4 py-3 text-left font-medium">Account</th>
                                <th className="px-4 py-3 text-right font-medium">Amount</th>
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction) => (
                                <tr key={transaction.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDate(transaction.date)}</td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <span className="font-medium">{transaction.description || '—'}</span>
                                            {transaction.is_recurring && <span className="ml-2 text-xs text-muted-foreground">{FREQUENCY_LABELS[transaction.frequency]}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{getCategoryLabel(transaction.category)}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{transaction.account?.name ?? '—'}</td>
                                    <td className={`px-4 py-3 text-right font-medium tabular-nums ${type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingTransaction(transaction)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(transaction)} className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <ReceiptIcon className="text-muted-foreground h-12 w-12" />
                    <div>
                        <p className="font-medium">No {type === 'income' ? 'income' : 'expenses'} yet</p>
                        <p className="text-muted-foreground text-sm">Add your first entry to get started.</p>
                    </div>
                </div>
            )}

            <Dialog open={Boolean(editingTransaction)} onOpenChange={(open) => !open && setEditingTransaction(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Edit Transaction</DialogTitle></DialogHeader>
                    {editingTransaction && (
                        <TransactionForm transaction={editingTransaction} accounts={accounts} categories={categories} transactionType={type} onClose={() => setEditingTransaction(null)} />
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={Boolean(deleting)}
                description={`Delete this transaction of ${deleting ? formatCurrency(deleting.amount) : ''}? This will also revert the account balance.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleting(null)}
            />
        </div>
    );
}

export { TransactionForm };
