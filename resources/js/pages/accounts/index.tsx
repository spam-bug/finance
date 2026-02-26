import { TransactionForm } from '@/components/transactions/transaction-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEcho } from '@laravel/echo-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { type Account, type Category } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal, PlusIcon, WalletIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

type Props = { accounts: Account[]; categories: Category[] };

const ACCOUNT_TYPE_LABELS: Record<string, string> = { cash: 'Cash', bank: 'Bank', e_wallet: 'E-Wallet', investment: 'Investment' };
const ACCOUNT_TYPE_COLORS: Record<string, string> = {
    cash: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    bank: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    e_wallet: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    investment: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

function formatCurrency(amount: string | number): string {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount));
}

type AccountFormProps = { account?: Account; onClose: () => void };

function AccountForm({ account, onClose }: AccountFormProps) {
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
        toast.loading('Processing...', { id: 'form-processing' });
        onClose();
        if (isEditing && account) {
            router.put(`/accounts/${account.id}`, form.data);
        } else {
            router.post('/accounts', form.data);
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

type AccountCardProps = { account: Account; categories: Category[]; accounts: Account[]; onEdit: () => void; onDelete: () => void };

function AccountCard({ account, categories, accounts, onEdit, onDelete }: AccountCardProps) {
    const [entryType, setEntryType] = useState<'income' | 'expense'>('expense');
    const [entryOpen, setEntryOpen] = useState(false);

    return (
        <Card className={account.is_active ? '' : 'opacity-60'}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base">{account.name}</CardTitle>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ACCOUNT_TYPE_COLORS[account.type]}`}>
                        {ACCOUNT_TYPE_LABELS[account.type]}
                    </span>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Actions</span></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
                {account.notes && <p className="text-muted-foreground text-sm">{account.notes}</p>}
                {account.is_active && (
                    <div className="flex gap-2">
                        <Dialog open={entryOpen && entryType === 'income'} onOpenChange={(o) => { setEntryType('income'); setEntryOpen(o); }}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1 h-8 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950" onClick={() => setEntryType('income')}>+ Income</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader><DialogTitle>Add Income to {account.name}</DialogTitle></DialogHeader>
                                <TransactionForm accounts={accounts} categories={categories} transactionType="income" defaultAccountId={String(account.id)} onClose={() => setEntryOpen(false)} />
                            </DialogContent>
                        </Dialog>
                        <Dialog open={entryOpen && entryType === 'expense'} onOpenChange={(o) => { setEntryType('expense'); setEntryOpen(o); }}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1 h-8 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950" onClick={() => setEntryType('expense')}>- Expense</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader><DialogTitle>Add Expense to {account.name}</DialogTitle></DialogHeader>
                                <TransactionForm accounts={accounts} categories={categories} transactionType="expense" defaultAccountId={String(account.id)} onClose={() => setEntryOpen(false)} />
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function AccountsIndex({ accounts, categories }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [deleting, setDeleting] = useState<Account | null>(null);

    const reloadAccounts = () => router.reload({ only: ['accounts'] });
    useEcho(`accounts.${auth.user.id}`, '.accounts.created', () => { reloadAccounts(); toast.success('Account added.', { id: 'form-processing' }); });
    useEcho(`accounts.${auth.user.id}`, '.accounts.updated', () => { reloadAccounts(); toast.success('Account updated.', { id: 'form-processing' }); });
    useEcho(`accounts.${auth.user.id}`, '.accounts.deleted', () => { reloadAccounts(); toast.success('Account removed.', { id: 'form-processing' }); });

    function handleDelete(account: Account) {
        setDeleting(account);
    }

    function confirmDelete() {
        if (!deleting) return;
        toast.loading('Processing...', { id: 'form-processing' });
        router.delete(`/accounts/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    const activeAccounts = accounts.filter((a) => a.is_active);
    const inactiveAccounts = accounts.filter((a) => !a.is_active);
    const totalBalance = activeAccounts.reduce((sum, a) => sum + Number(a.balance), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
                    <p className="text-muted-foreground text-sm">Manage your wallets and bank accounts.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusIcon className="mr-2 h-4 w-4" />Add Account</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>New Account</DialogTitle></DialogHeader>
                        <AccountForm onClose={() => setIsCreateOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Total Active Balance</CardDescription>
                    <CardTitle className="text-3xl">{formatCurrency(totalBalance)}</CardTitle>
                </CardHeader>
            </Card>

            {activeAccounts.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {activeAccounts.map((account) => (
                        <AccountCard key={account.id} account={account} categories={categories} accounts={accounts} onEdit={() => setEditingAccount(account)} onDelete={() => handleDelete(account)} />
                    ))}
                </div>
            )}

            {inactiveAccounts.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-muted-foreground text-sm font-medium">Inactive</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {inactiveAccounts.map((account) => (
                            <AccountCard key={account.id} account={account} categories={categories} accounts={accounts} onEdit={() => setEditingAccount(account)} onDelete={() => handleDelete(account)} />
                        ))}
                    </div>
                </div>
            )}

            {accounts.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <WalletIcon className="text-muted-foreground h-12 w-12" />
                    <div>
                        <p className="font-medium">No accounts yet</p>
                        <p className="text-muted-foreground text-sm">Add your first account to get started.</p>
                    </div>
                </div>
            )}

            <Dialog open={Boolean(editingAccount)} onOpenChange={(open) => !open && setEditingAccount(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Account</DialogTitle></DialogHeader>
                    {editingAccount && <AccountForm account={editingAccount} onClose={() => setEditingAccount(null)} />}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={Boolean(deleting)}
                description={`Delete "${deleting?.name}"? All transactions for this account will also be removed.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleting(null)}
            />
        </div>
    );
}

AccountsIndex.layout = (page: ReactNode) => <AppLayout breadcrumb="Accounts">{page}</AppLayout>;
