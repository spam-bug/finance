import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type Account, type Goal } from '@/types';
import { router, useForm } from '@inertiajs/react';
import { FlagIcon, MoreHorizontal, PlusIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';

type Props = { goals: Goal[]; accounts: Account[] };

function formatCurrency(v: string | number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(v));
}

type GoalFormProps = { goal?: Goal; accounts: Account[]; onClose: () => void };

function GoalForm({ goal, accounts, onClose }: GoalFormProps) {
    const isEditing = Boolean(goal);
    const form = useForm({
        name: goal?.name ?? '',
        target_amount: goal?.target_amount ?? '',
        current_amount: goal?.current_amount ?? '0',
        target_date: goal?.target_date?.split('T')[0] ?? '',
        account_id: goal?.account_id ? String(goal.account_id) : '',
        notes: goal?.notes ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = { ...form.data, account_id: form.data.account_id ? Number(form.data.account_id) : null };
        if (isEditing && goal) {
            router.put(`/goals/${goal.id}`, payload, { onSuccess: onClose });
        } else {
            router.post('/goals', payload, { onSuccess: onClose });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Buy a car" />
                {form.errors.name && <p className="text-destructive text-sm">{form.errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="target_amount">Target Amount</Label>
                    <Input id="target_amount" type="number" min="0.01" step="0.01" value={form.data.target_amount} onChange={(e) => form.setData('target_amount', e.target.value)} />
                    {form.errors.target_amount && <p className="text-destructive text-sm">{form.errors.target_amount}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="current_amount">Current Amount</Label>
                    <Input id="current_amount" type="number" min="0" step="0.01" value={form.data.current_amount} onChange={(e) => form.setData('current_amount', e.target.value)} />
                </div>
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
            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : isEditing ? 'Save changes' : 'Create Goal'}</Button>
            </div>
        </form>
    );
}

export default function GoalsIndex({ goals, accounts }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Goal | null>(null);

    function handleDelete(goal: Goal) {
        if (!confirm(`Delete "${goal.name}"?`)) return;
        router.delete(`/goals/${goal.id}`);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Financial Goals</h1>
                    <p className="text-muted-foreground text-sm">Set and track your financial milestones.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusIcon className="mr-2 h-4 w-4" />New Goal</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>New Financial Goal</DialogTitle></DialogHeader>
                        <GoalForm accounts={accounts} onClose={() => setIsCreateOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            {goals.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {goals.map((goal) => {
                        const progress = Number(goal.target_amount) > 0 ? Math.min((Number(goal.current_amount) / Number(goal.target_amount)) * 100, 100) : 0;
                        return (
                            <Card key={goal.id}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div>
                                        <CardTitle className="text-base">{goal.name}</CardTitle>
                                        {goal.target_date && <p className="text-muted-foreground text-xs">By {new Date(goal.target_date + 'T00:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'short' })}</p>}
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
                                    <p className="text-muted-foreground text-xs">{progress.toFixed(0)}% complete</p>
                                    {goal.notes && <p className="text-muted-foreground text-xs">{goal.notes}</p>}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <FlagIcon className="text-muted-foreground h-12 w-12" />
                    <div>
                        <p className="font-medium">No goals yet</p>
                        <p className="text-muted-foreground text-sm">Set a financial goal to work towards.</p>
                    </div>
                </div>
            )}

            <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Edit Goal</DialogTitle></DialogHeader>
                    {editing && <GoalForm goal={editing} accounts={accounts} onClose={() => setEditing(null)} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}

GoalsIndex.layout = (page: ReactNode) => <AppLayout breadcrumb="Goals">{page}</AppLayout>;
