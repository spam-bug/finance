import { TransactionList } from '@/components/transactions/transaction-list';
import AppLayout from '@/layouts/app-layout';
import { type Account, type Category, type Transaction } from '@/types';
import { type ReactNode } from 'react';

type Props = {
    transactions: Transaction[];
    accounts: Account[];
    categories: Category[];
};

export default function IncomeIndex({ transactions, accounts, categories }: Props) {
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
