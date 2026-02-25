import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type Account } from '@/types';
import ReactECharts from 'echarts-for-react';
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, TrendingUpIcon, WalletIcon } from 'lucide-react';
import { type ReactNode } from 'react';

type MonthData = { month: string; income: number; expenses: number };
type CategoryData = { name: string; value: number };
type BudgetUsage = { category: string; budget: number; spent: number };
type UpcomingPayment = { credit_name: string; amount: number; due_date: string };

type Props = {
    accounts: Account[];
    monthlyIncome: number;
    monthlyExpenses: number;
    sixMonthsData: MonthData[];
    expensesByCategory: CategoryData[];
    budgetUsage: BudgetUsage[];
    totalInvestmentValue: number;
    upcomingPayments: UpcomingPayment[];
};

function formatCurrency(v: number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v);
}

function formatDate(date: string) {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

export default function Dashboard({
    accounts,
    monthlyIncome,
    monthlyExpenses,
    sixMonthsData,
    expensesByCategory,
    budgetUsage,
    totalInvestmentValue,
    upcomingPayments,
}: Props) {
    const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
    const netCashFlow = monthlyIncome - monthlyExpenses;

    // Income vs Expenses bar chart
    const cashFlowOptions = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['Income', 'Expenses'], bottom: 0 },
        grid: { top: 10, right: 10, bottom: 40, left: 60 },
        xAxis: {
            type: 'category',
            data: sixMonthsData.map((d) => d.month),
            axisLabel: { fontSize: 11 },
        },
        yAxis: {
            type: 'value',
            axisLabel: { formatter: (v: number) => `₱${(v / 1000).toFixed(0)}k`, fontSize: 11 },
        },
        series: [
            { name: 'Income', type: 'bar', data: sixMonthsData.map((d) => d.income), color: '#22c55e', barMaxWidth: 30 },
            { name: 'Expenses', type: 'bar', data: sixMonthsData.map((d) => d.expenses), color: '#ef4444', barMaxWidth: 30 },
        ],
    };

    // Expenses by category donut chart
    const categoryOptions = {
        tooltip: { trigger: 'item', formatter: (p: { name: string; value: number; percent: number }) => `${p.name}: ₱${p.value.toLocaleString()} (${p.percent}%)` },
        legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 11 }, formatter: (name: string) => name.length > 12 ? name.slice(0, 12) + '…' : name },
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['35%', '50%'],
            data: expensesByCategory.length > 0 ? expensesByCategory : [{ name: 'No data', value: 1 }],
            emphasis: { itemStyle: { shadowBlur: 10 } },
            label: { show: false },
        }],
    };

    // Budget usage horizontal bar chart
    const budgetOptions = {
        tooltip: {
            trigger: 'axis',
            formatter: (params: Array<{ seriesName: string; value: number; name: string }>) => {
                return params.map((p) => `${p.seriesName}: ₱${p.value.toLocaleString()}`).join('<br/>');
            },
        },
        legend: { data: ['Budget', 'Spent'], bottom: 0 },
        grid: { top: 10, right: 10, bottom: 40, left: 120 },
        xAxis: { type: 'value', axisLabel: { formatter: (v: number) => `₱${(v / 1000).toFixed(0)}k`, fontSize: 11 } },
        yAxis: { type: 'category', data: budgetUsage.map((b) => b.category), axisLabel: { fontSize: 11 } },
        series: [
            { name: 'Budget', type: 'bar', data: budgetUsage.map((b) => b.budget), color: '#94a3b8', barMaxWidth: 20 },
            {
                name: 'Spent',
                type: 'bar',
                data: budgetUsage.map((b) => ({ value: b.spent, itemStyle: { color: b.spent > b.budget ? '#ef4444' : '#3b82f6' } })),
                barMaxWidth: 20,
            },
        ],
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground text-sm">{new Date().toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</p>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                        <WalletIcon className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
                        <p className="text-muted-foreground text-xs">{accounts.length} active account{accounts.length !== 1 ? 's' : ''}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month Income</CardTitle>
                        <ArrowUpIcon className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(monthlyIncome)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month Expenses</CardTitle>
                        <ArrowDownIcon className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(monthlyExpenses)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
                        <TrendingUpIcon className={`h-4 w-4 ${netCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts row */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Cash flow chart - 2 cols */}
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle className="text-base">Income vs Expenses (Last 6 months)</CardTitle></CardHeader>
                    <CardContent>
                        <ReactECharts option={cashFlowOptions} style={{ height: 240 }} />
                    </CardContent>
                </Card>

                {/* Category breakdown - 1 col */}
                <Card>
                    <CardHeader><CardTitle className="text-base">Expenses by Category</CardTitle></CardHeader>
                    <CardContent>
                        {expensesByCategory.length > 0 ? (
                            <ReactECharts option={categoryOptions} style={{ height: 240 }} />
                        ) : (
                            <div className="flex h-60 items-center justify-center text-muted-foreground text-sm">No expenses this month</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Budget + Accounts + Upcoming payments */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Budget usage */}
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle className="text-base">Budget Usage This Month</CardTitle></CardHeader>
                    <CardContent>
                        {budgetUsage.length > 0 ? (
                            <ReactECharts option={budgetOptions} style={{ height: Math.max(160, budgetUsage.length * 40 + 60) }} />
                        ) : (
                            <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">No budgets set for this month</div>
                        )}
                    </CardContent>
                </Card>

                {/* Accounts + Investment + Upcoming payments */}
                <div className="space-y-4">
                    {/* Accounts */}
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-base">Accounts</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {accounts.length > 0 ? accounts.map((acc) => (
                                <div key={acc.id} className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground truncate">{acc.name}</span>
                                    <span className="font-medium tabular-nums">{formatCurrency(Number(acc.balance))}</span>
                                </div>
                            )) : (
                                <p className="text-muted-foreground text-sm">No accounts</p>
                            )}
                            {totalInvestmentValue > 0 && (
                                <div className="flex items-center justify-between border-t pt-2 text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1"><TrendingUpIcon className="h-3 w-3" />Investments</span>
                                    <span className="font-medium tabular-nums">{formatCurrency(totalInvestmentValue)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming credit payments */}
                    {upcomingPayments.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-1 text-base"><CalendarIcon className="h-4 w-4" />Upcoming Payments</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {upcomingPayments.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div>
                                            <p className="font-medium truncate">{p.credit_name}</p>
                                            <p className="text-muted-foreground text-xs">{formatDate(p.due_date)}</p>
                                        </div>
                                        <span className="font-medium text-red-600 dark:text-red-400 tabular-nums">{formatCurrency(p.amount)}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

Dashboard.layout = (page: ReactNode) => <AppLayout breadcrumb="Dashboard">{page}</AppLayout>;
