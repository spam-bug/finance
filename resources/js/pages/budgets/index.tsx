import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEcho } from '@laravel/echo-react';
import { BudgetForm, getCategoryLabel } from '@/components/budgets/budget-form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { formatCurrency } from '@/lib/format';
import AppLayout from '@/layouts/app-layout';
import { type Budget, type Category } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, PlusIcon, Target } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

type BudgetWithSpent = Budget & { spent: number };
type Props = { budgets: BudgetWithSpent[]; categories: Category[]; month: number; year: number };

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function BudgetsIndex({ budgets, categories, month, year }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deleting, setDeleting] = useState<BudgetWithSpent | null>(null);

    const reloadBudgets = (event: { message: string }) => {
        router.reload({ only: ['budgets'] })
        toast.success(event.message)
    }
    useEcho(`budgets.${auth.user.id}`, '.budgets.created', (event) => { reloadBudgets(event) });
    useEcho(`budgets.${auth.user.id}`, '.budgets.deleted', (event) => { reloadBudgets(event) });

    function navigate(direction: -1 | 1) {
        let m = month + direction;
        let y = year;
        if (m < 1) { m = 12; y--; }
        if (m > 12) { m = 1; y++; }
        router.get('/budgets', { month: m, year: y });
    }

    function handleDelete(budget: BudgetWithSpent) {
        setDeleting(budget);
    }

    function confirmDelete() {
        if (!deleting) return;
        toast.info('Processing request...');
        router.delete(`/budgets/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
                    <p className="text-muted-foreground text-sm">Manage monthly spending budgets by category.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusIcon className="mr-2 h-4 w-4" />Add Budget</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                        <DialogHeader><DialogTitle>Set Budget</DialogTitle></DialogHeader>
                        <BudgetForm categories={categories} month={month} year={year} onClose={() => setIsCreateOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Month navigation */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-lg font-medium">{MONTH_NAMES[month - 1]} {year}</span>
                <Button variant="outline" size="icon" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2"><p className="text-muted-foreground text-sm">Total Budget</p><CardTitle className="text-2xl">{formatCurrency(totalBudget)}</CardTitle></CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><p className="text-muted-foreground text-sm">Total Spent</p><CardTitle className={`text-2xl ${totalSpent > totalBudget ? 'text-red-600' : ''}`}>{formatCurrency(totalSpent)}</CardTitle></CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><p className="text-muted-foreground text-sm">Remaining</p><CardTitle className={`text-2xl ${totalBudget - totalSpent < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(totalBudget - totalSpent)}</CardTitle></CardHeader>
                </Card>
            </div>

            {budgets.length > 0 ? (
                <div className="space-y-3">
                    {budgets.map((budget) => {
                        const progress = Number(budget.amount) > 0 ? Math.min((budget.spent / Number(budget.amount)) * 100, 100) : 0;
                        const isOver = budget.spent > Number(budget.amount);
                        return (
                            <Card key={budget.id}>
                                <CardContent className="pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{getCategoryLabel(budget.category)}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm">
                                                <span className={isOver ? 'text-red-600 font-semibold' : ''}>{formatCurrency(budget.spent)}</span>
                                                <span className="text-muted-foreground"> / {formatCurrency(budget.amount)}</span>
                                            </span>
                                            <Button variant="ghost" size="sm" className="h-7 text-destructive hover:text-destructive" onClick={() => handleDelete(budget)}>Remove</Button>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-muted">
                                        <div className={`h-2 rounded-full transition-all ${isOver ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${progress}%` }} />
                                    </div>
                                    <p className="text-muted-foreground text-xs mt-1">{progress.toFixed(0)}% used</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <Target className="text-muted-foreground h-12 w-12" />
                    <div>
                        <p className="font-medium">No budgets for this month</p>
                        <p className="text-muted-foreground text-sm">Set budgets to track your spending limits.</p>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={Boolean(deleting)}
                confirmLabel="Remove"
                description="Remove this budget? The category spending data will be retained."
                onConfirm={confirmDelete}
                onCancel={() => setDeleting(null)}
            />
        </div>
    );
}

BudgetsIndex.layout = (page: ReactNode) => <AppLayout breadcrumb="Budgets">{page}</AppLayout>;
