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

export default function IncomeIndex({ transactions, accounts, categories }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;

    const reloadTransactions = (event: { message: string }) => {
        router.reload({ only: ['transactions', 'accounts'] });
        toast.success(event.message);
    };
    useEcho(`transactions.${auth.user.id}`, '.transactions.created', (event) => { reloadTransactions(event); });
    useEcho(`transactions.${auth.user.id}`, '.transactions.updated', (event) => { reloadTransactions(event); });
    useEcho(`transactions.${auth.user.id}`, '.transactions.deleted', (event) => { reloadTransactions(event); });
    useEcho(`accounts.${auth.user.id}`, '.accounts.updated', () => router.reload({ only: ['transactions', 'accounts'] }));

    return (
        <TransactionList
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            type="income"
            title="Income"
            description="Track all your income entries."
        />
    );
}

IncomeIndex.layout = (page: ReactNode) => <AppLayout breadcrumb="Income">{page}</AppLayout>;
