import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEcho } from '@laravel/echo-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { type Account, type SavingsGoal } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal, PiggyBankIcon, PlusCircleIcon, PlusIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';

type Props = { savings_goals: SavingsGoal[]; accounts: Account[] };

function formatCurrency(v: string | number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(v));
}

function AddContributionDialog({ goal }: { goal: SavingsGoal }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ amount: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const newAmount = Number(goal.current_amount) + Number(form.data.amount);
        router.put(`/savings/${goal.id}`, {
            name: goal.name,
            monthly_contribution: goal.monthly_contribution,
            target_amount: goal.target_amount,
            current_amount: String(newAmount),
            target_date: goal.target_date ?? '',
            account_id: goal.account_id,
        }, {
            onSuccess: () => { setOpen(false); form.reset(); },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full h-8"><PlusCircleIcon className="mr-1 h-3.5 w-3.5" />Add Contribution</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Add to {goal.name}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount to add</Label>
                        <CurrencyInput id="amount" min="0.01" step="0.01" value={form.data.amount} onChange={(e) => form.setData('amount', e.target.value)} placeholder="0.00" autoFocus />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : 'Add'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

type FormProps = { goal?: SavingsGoal; accounts: Account[]; onClose: () => void };

function SavingsGoalForm({ goal, accounts, onClose }: FormProps) {
    const isEditing = Boolean(goal);
    const form = useForm({
        name: goal?.name ?? '',
        monthly_contribution: goal?.monthly_contribution ?? '',
        target_amount: goal?.target_amount ?? '',
        current_amount: goal?.current_amount ?? '0',
        target_date: goal?.target_date ? goal.target_date.split('T')[0] : '',
        account_id: goal?.account_id ? String(goal.account_id) : '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = { ...form.data, account_id: form.data.account_id ? Number(form.data.account_id) : null };
        if (isEditing && goal) {
            router.put(`/savings/${goal.id}`, payload, { onSuccess: onClose });
        } else {
            router.post('/savings', payload, { onSuccess: onClose });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Emergency Fund" />
                {form.errors.name && <p className="text-destructive text-sm">{form.errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="target_amount">Target Amount</Label>
                    <CurrencyInput id="target_amount" min="0.01" step="0.01" value={form.data.target_amount} onChange={(e) => form.setData('target_amount', e.target.value)} />
                    {form.errors.target_amount && <p className="text-destructive text-sm">{form.errors.target_amount}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="current_amount">Current Amount</Label>
                    <CurrencyInput id="current_amount" min="0" step="0.01" value={form.data.current_amount} onChange={(e) => form.setData('current_amount', e.target.value)} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="monthly_contribution">Monthly Contribution</Label>
                <CurrencyInput id="monthly_contribution" min="0" step="0.01" value={form.data.monthly_contribution} onChange={(e) => form.setData('monthly_contribution', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="target_date">Target Date</Label>
                    <Input id="target_date" type="date" value={form.data.target_date} onChange={(e) => form.setData('target_date', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="account_id">Linked Account</Label>
                    <Select value={form.data.account_id} onValueChange={(v) => form.setData('account_id', v === '__none' ? '' : v)}>
                        <SelectTrigger id="account_id"><SelectValue placeholder="None" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__none">None</SelectItem>
                            {accounts.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : isEditing ? 'Save changes' : 'Create Goal'}</Button>
            </div>
        </form>
    );
}

export default function SavingsIndex({ savings_goals, accounts }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState<SavingsGoal | null>(null);
    const [deleting, setDeleting] = useState<SavingsGoal | null>(null);

    useEcho(`savings.${auth.user.id}`, ['.savings.created', '.savings.updated', '.savings.deleted'], () => router.reload({ only: ['savings_goals'] }));

    function handleDelete(goal: SavingsGoal) {
        setDeleting(goal);
    }

    function confirmDelete() {
        if (!deleting) return;
        router.delete(`/savings/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    const totalSaved = savings_goals.reduce((sum, g) => sum + Number(g.current_amount), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Savings Goals</h1>
                    <p className="text-muted-foreground text-sm">Track your savings targets and progress.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusIcon className="mr-2 h-4 w-4" />New Goal</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>New Savings Goal</DialogTitle></DialogHeader>
                        <SavingsGoalForm accounts={accounts} onClose={() => setIsCreateOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <p className="text-muted-foreground text-sm">Total Saved</p>
                    <CardTitle className="text-3xl">{formatCurrency(totalSaved)}</CardTitle>
                </CardHeader>
            </Card>

            {savings_goals.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {savings_goals.map((goal) => {
                        const progress = Number(goal.target_amount) > 0 ? Math.min((Number(goal.current_amount) / Number(goal.target_amount)) * 100, 100) : 0;
                        return (
                            <Card key={goal.id}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div>
                                        <CardTitle className="text-base">{goal.name}</CardTitle>
                                        {goal.target_date && <p className="text-muted-foreground text-xs">Target: {new Date(goal.target_date.split('T')[0] + 'T00:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'short' })}</p>}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditing(goal)}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(goal)} className="text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{formatCurrency(goal.current_amount)}</span>
                                        <span className="text-muted-foreground">of {formatCurrency(goal.target_amount)}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-muted">
                                        <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                                    </div>
                                    <p className="text-muted-foreground text-xs">{progress.toFixed(0)}% · {formatCurrency(goal.monthly_contribution)}/mo</p>
                                    <AddContributionDialog goal={goal} />
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <PiggyBankIcon className="text-muted-foreground h-12 w-12" />
                    <div>
                        <p className="font-medium">No savings goals yet</p>
                        <p className="text-muted-foreground text-sm">Create a goal to start tracking your savings.</p>
                    </div>
                </div>
            )}

            <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Edit Savings Goal</DialogTitle></DialogHeader>
                    {editing && <SavingsGoalForm goal={editing} accounts={accounts} onClose={() => setEditing(null)} />}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={Boolean(deleting)}
                description={`Delete "${deleting?.name}"? This action cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleting(null)}
            />
        </div>
    );
}

SavingsIndex.layout = (page: ReactNode) => <AppLayout breadcrumb="Savings Goals">{page}</AppLayout>;
