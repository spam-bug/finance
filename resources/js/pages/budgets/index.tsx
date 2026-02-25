import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type Budget, type Category } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, PlusIcon, Target } from 'lucide-react';
import { type ReactNode, useState } from 'react';

type BudgetWithSpent = Budget & { spent: number };
type Props = { budgets: BudgetWithSpent[]; categories: Category[]; month: number; year: number };

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatCurrency(v: string | number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(v));
}

function getCategoryLabel(category: Category | undefined): string {
    if (!category) return 'Unknown';
    return category.parent ? `${category.parent.name} › ${category.name}` : category.name;
}

function BudgetForm({ categories, month, year, onClose }: { categories: Category[]; month: number; year: number; onClose: () => void }) {
    const form = useForm({ category_id: '', amount: '', month: String(month), year: String(year) });
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.post('/budgets', { ...form.data, category_id: Number(form.data.category_id), month: Number(form.data.month), year: Number(form.data.year) }, { onSuccess: onClose });
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <Select value={form.data.category_id} onValueChange={(v) => form.setData('category_id', v)}>
                    <SelectTrigger id="category_id"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                        {categories.map((cat) => <SelectItem key={cat.id} value={String(cat.id)}>{getCategoryLabel(cat)}</SelectItem>)}
                    </SelectContent>
                </Select>
                {form.errors.category_id && <p className="text-destructive text-sm">{form.errors.category_id}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="amount">Budget Amount</Label>
                <Input id="amount" type="number" min="0.01" step="0.01" value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} />
                {form.errors.amount && <p className="text-destructive text-sm">{form.errors.amount}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : 'Set Budget'}</Button>
            </div>
        </form>
    );
}

export default function BudgetsIndex({ budgets, categories, month, year }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    function navigate(direction: -1 | 1) {
        let m = month + direction;
        let y = year;
        if (m < 1) { m = 12; y--; }
        if (m > 12) { m = 1; y++; }
        router.get('/budgets', { month: m, year: y });
    }

    function handleDelete(budget: Budget) {
        if (!confirm('Remove this budget?')) return;
        router.delete(`/budgets/${budget.id}`);
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
        </div>
    );
}

BudgetsIndex.layout = (page: ReactNode) => <AppLayout breadcrumb="Budgets">{page}</AppLayout>;
