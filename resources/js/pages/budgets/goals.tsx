import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useEcho } from '@laravel/echo-react';
import { AddContributionDialog } from '@/components/goals/add-contribution-dialog';
import { GoalForm } from '@/components/goals/goal-form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { formatCurrency } from '@/lib/format';
import AppLayout from '@/layouts/app-layout';
import { type Account, type Goal } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { FlagIcon, MoreHorizontal, PlusIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

type Props = { goals: Goal[]; accounts: Account[] };

export default function GoalsIndex({ goals, accounts }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Goal | null>(null);
    const [deleting, setDeleting] = useState<Goal | null>(null);

    const reloadGoals = (event: { message: string }) => {
        router.reload({ only: ['goals'] })

        toast.success(event.message)
    };
    useEcho(`goals.${auth.user.id}`, '.goals.created', (event) => { reloadGoals(event) })
    useEcho(`goals.${auth.user.id}`, '.goals.updated', (event) => { reloadGoals(event) })
    useEcho(`goals.${auth.user.id}`, '.goals.deleted', (event) => { reloadGoals(event) })

    function handleDelete(goal: Goal) {
        setDeleting(goal);
    }

    function confirmDelete() {
        if (!deleting) return;
        toast.loading('Processing...');
        router.delete(`/goals/${deleting.id}`, { onFinish: () => setDeleting(null) });
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
                                        {goal.target_date && <p className="text-muted-foreground text-xs">By {new Date(goal.target_date.split('T')[0] + 'T00:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'short' })}</p>}
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
                                    <AddContributionDialog goal={goal} />
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

            <ConfirmDialog
                open={Boolean(deleting)}
                description={`Delete "${deleting?.name}"? This action cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleting(null)}
            />
        </div>
    );
}

GoalsIndex.layout = (page: ReactNode) => <AppLayout breadcrumb="Goals">{page}</AppLayout>;
