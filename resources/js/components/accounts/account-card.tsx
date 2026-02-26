import { TransactionForm } from '@/components/transactions/transaction-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/format';
import { type Account, type Category } from '@/types';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

const ACCOUNT_TYPE_LABELS: Record<string, string> = { cash: 'Cash', bank: 'Bank', e_wallet: 'E-Wallet', investment: 'Investment' };
const ACCOUNT_TYPE_COLORS: Record<string, string> = {
    cash: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    bank: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    e_wallet: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    investment: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

type AccountCardProps = { account: Account; categories: Category[]; accounts: Account[]; onEdit: () => void; onDelete: () => void };

export function AccountCard({ account, categories, accounts, onEdit, onDelete }: AccountCardProps) {
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
