export type * from './auth';

export type Account = {
    id: number;
    user_id: number;
    name: string;
    type: 'cash' | 'bank' | 'e_wallet' | 'investment';
    initial_balance: string;
    balance: string;
    notes: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type Category = {
    id: number;
    user_id: number;
    parent_id: number | null;
    name: string;
    type: 'income' | 'expense' | 'both';
    color: string | null;
    parent?: Category;
    children?: Category[];
};

export type Transaction = {
    id: number;
    user_id: number;
    account_id: number;
    category_id: number | null;
    parent_id: number | null;
    type: 'income' | 'expense';
    amount: string;
    date: string;
    description: string | null;
    notes: string | null;
    frequency: 'one_time' | 'monthly' | 'bi_monthly' | 'quarterly' | 'annually';
    is_recurring: boolean;
    account?: Account;
    category?: Category;
    created_at: string;
    updated_at: string;
};

export type CreditPayment = {
    id: number;
    credit_id: number;
    account_id: number | null;
    transaction_id: number | null;
    amount: string;
    due_date: string;
    paid_at: string | null;
    account?: Account;
};

export type Credit = {
    id: number;
    user_id: number;
    name: string;
    total_amount: string | null;
    payment_frequency: 'monthly' | 'quarterly';
    number_of_payments: number | null;
    amount_per_payment: string;
    start_date: string;
    notes: string | null;
    is_indefinite: boolean;
    payments?: CreditPayment[];
    created_at: string;
    updated_at: string;
};

export type SavingsGoal = {
    id: number;
    user_id: number;
    account_id: number | null;
    name: string;
    monthly_contribution: string;
    target_amount: string;
    current_amount: string;
    target_date: string | null;
    account?: Account;
    created_at: string;
    updated_at: string;
};

export type InvestmentUpdate = {
    id: number;
    investment_id: number;
    value: string;
    date: string;
    notes: string | null;
};

export type Investment = {
    id: number;
    user_id: number;
    account_id: number | null;
    name: string;
    type: 'shares' | 'bonds' | 'other';
    initial_value: string;
    current_value: string;
    notes: string | null;
    account?: Account;
    updates?: InvestmentUpdate[];
    created_at: string;
    updated_at: string;
};

export type Budget = {
    id: number;
    user_id: number;
    category_id: number;
    amount: string;
    month: number;
    year: number;
    category?: Category;
    created_at: string;
    updated_at: string;
};

export type Goal = {
    id: number;
    user_id: number;
    account_id: number | null;
    name: string;
    target_amount: string;
    current_amount: string;
    target_date: string | null;
    notes: string | null;
    account?: Account;
    created_at: string;
    updated_at: string;
};
