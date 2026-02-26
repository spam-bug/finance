import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useEcho } from '@laravel/echo-react';
import { AddContributionDialog } from '@/components/savings/add-contribution-dialog';
import { SavingsGoalForm } from '@/components/savings/savings-goal-form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { formatCurrency } from '@/lib/format';
import AppLayout from '@/layouts/app-layout';
import { type Account, type SavingsGoal } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { MoreHorizontal, PiggyBankIcon, PlusIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

type Props = { savings_goals: SavingsGoal[]; accounts: Account[] };

export default function SavingsIndex({ savings_goals, accounts }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState<SavingsGoal | null>(null);
    const [deleting, setDeleting] = useState<SavingsGoal | null>(null);

    const reloadSavings = (event: { message: string }) => {
        router.reload({ only: ['savings_goals'] });
        toast.success(event.message);
    };
    useEcho(`savings.${auth.user.id}`, '.savings.created', (event) => { reloadSavings(event); });
    useEcho(`savings.${auth.user.id}`, '.savings.updated', (event) => { reloadSavings(event); });
    useEcho(`savings.${auth.user.id}`, '.savings.deleted', (event) => { reloadSavings(event); });

    function handleDelete(goal: SavingsGoal) {
        setDeleting(goal);
    }

    function confirmDelete() {
        if (!deleting) return;
        toast.loading('Processing...');
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
