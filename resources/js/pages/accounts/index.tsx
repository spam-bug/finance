import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEcho } from '@laravel/echo-react';
import { AccountCard } from '@/components/accounts/account-card';
import { AccountForm } from '@/components/accounts/account-form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { formatCurrency } from '@/lib/format';
import AppLayout from '@/layouts/app-layout';
import { type Account, type Category } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { PlusIcon, WalletIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

type Props = { accounts: Account[]; categories: Category[] };

export default function AccountsIndex({ accounts, categories }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [deleting, setDeleting] = useState<Account | null>(null);

    const reloadAccounts = (event: { message: string }) => {
        router.reload({ only: ['accounts'] })
        toast.success(event.message);
    }

    useEcho(`accounts.${auth.user.id}`, '.accounts.created', (event) => { reloadAccounts(event) });
    useEcho(`accounts.${auth.user.id}`, '.accounts.updated', (event) => { reloadAccounts(event) });
    useEcho(`accounts.${auth.user.id}`, '.accounts.deleted', (event) => { reloadAccounts(event) });

    function handleDelete(account: Account) {
        setDeleting(account);
    }

    function confirmDelete() {
        if (!deleting) return;
        toast.loading('Processing...');
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
