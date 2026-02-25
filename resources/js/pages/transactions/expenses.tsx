import { TransactionList } from '@/components/transactions/transaction-list';
import AppLayout from '@/layouts/app-layout';
import { type Account, type Category, type Transaction } from '@/types';
import { type ReactNode } from 'react';

type Props = {
    transactions: Transaction[];
    accounts: Account[];
    categories: Category[];
};

export default function ExpensesIndex({ transactions, accounts, categories }: Props) {
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
