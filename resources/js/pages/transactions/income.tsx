import { TransactionList } from '@/components/transactions/transaction-list';
import { useEcho } from '@laravel/echo-react';
import AppLayout from '@/layouts/app-layout';
import { type Account, type Category, type Transaction } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

type Props = {
    transactions: Transaction[];
    accounts: Account[];
    categories: Category[];
};

export default function IncomeIndex({ transactions, accounts, categories }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;

    const reload = () => router.reload({ only: ['transactions', 'accounts'] });
    useEcho(`transactions.${auth.user.id}`, ['.transactions.created', '.transactions.updated', '.transactions.deleted'], reload);
    useEcho(`accounts.${auth.user.id}`, '.accounts.updated', reload);

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
