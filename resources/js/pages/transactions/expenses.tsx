import { TransactionList } from '@/components/transactions/transaction-list';
import { useEcho } from '@laravel/echo-react';
import AppLayout from '@/layouts/app-layout';
import { type Account, type Category, type Transaction } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { toast } from 'sonner';

type Props = {
    transactions: Transaction[];
    accounts: Account[];
    categories: Category[];
};

export default function ExpensesIndex({ transactions, accounts, categories }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;

    const reload = () => router.reload({ only: ['transactions', 'accounts'] });
    useEcho(`transactions.${auth.user.id}`, '.transactions.created', () => { reload(); toast.success('Expense added.', { id: 'form-processing' }); });
    useEcho(`transactions.${auth.user.id}`, '.transactions.updated', () => { reload(); toast.success('Expense updated.', { id: 'form-processing' }); });
    useEcho(`transactions.${auth.user.id}`, '.transactions.deleted', () => { reload(); toast.success('Expense removed.', { id: 'form-processing' }); });
    useEcho(`accounts.${auth.user.id}`, '.accounts.updated', reload);

    return (
        <TransactionList
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            type="expense"
            title="Expenses"
            description="Track all your expense entries."
        />
    );
}

ExpensesIndex.layout = (page: ReactNode) => <AppLayout breadcrumb="Expenses">{page}</AppLayout>;
