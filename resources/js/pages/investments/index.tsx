import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEcho } from '@laravel/echo-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { type Account, type Investment } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal, PlusIcon, TrendingUpIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

type Props = { investments: Investment[]; accounts: Account[] };

const INVESTMENT_TYPE_LABELS: Record<string, string> = { shares: 'Shares', bonds: 'Bonds', other: 'Other' };

function formatCurrency(v: string | number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(v));
}

type InvestmentFormProps = { investment?: Investment; accounts: Account[]; onClose: () => void };

function InvestmentForm({ investment, accounts, onClose }: InvestmentFormProps) {
    const isEditing = Boolean(investment);
    const form = useForm({
        name: investment?.name ?? '',
        type: investment?.type ?? 'shares',
        initial_value: investment?.initial_value ?? '',
        current_value: investment?.current_value ?? '',
        account_id: investment?.account_id ? String(investment.account_id) : '',
        notes: investment?.notes ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = { ...form.data, account_id: form.data.account_id ? Number(form.data.account_id) : null };
        toast.loading('Processing...');
        onClose();
        if (isEditing && investment) {
            router.put(`/investments/${investment.id}`, payload);
        } else {
            router.post('/investments', payload);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. ACME Corp Stock" />
                {form.errors.name && <p className="text-destructive text-sm">{form.errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={form.data.type} onValueChange={(v) => form.setData('type', v as Investment['type'])}>
                        <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="shares">Shares</SelectItem>
                            <SelectItem value="bonds">Bonds</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
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
            {!isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="initial_value">Initial Value</Label>
                        <Input id="initial_value" type="number" min="0" step="0.01" value={form.data.initial_value} onChange={(e) => form.setData('initial_value', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="current_value">Current Value</Label>
                        <Input id="current_value" type="number" min="0" step="0.01" value={form.data.current_value} onChange={(e) => form.setData('current_value', e.target.value)} />
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="current_value">Current Value</Label>
                    <Input id="current_value" type="number" min="0" step="0.01" value={form.data.current_value} onChange={(e) => form.setData('current_value', e.target.value)} />
                </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : isEditing ? 'Save changes' : 'Add Investment'}</Button>
            </div>
        </form>
    );
}

type UpdateFormProps = { investmentId: number; onClose: () => void };
function UpdateValueForm({ investmentId, onClose }: UpdateFormProps) {
    const form = useForm({ value: '', date: new Date().toISOString().split('T')[0], notes: '' });
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        toast.loading('Processing...');
        onClose();
        router.post(`/investments/${investmentId}/updates`, form.data);
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="value">New Value</Label>
                    <Input id="value" type="number" min="0" step="0.01" value={form.data.value} onChange={(e) => form.setData('value', e.target.value)} />
                    {form.errors.value && <p className="text-destructive text-sm">{form.errors.value}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : 'Update Value'}</Button>
            </div>
        </form>
    );
}

export default function InvestmentsIndex({ investments, accounts }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Investment | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<Investment | null>(null);

    const reloadInvestments = (event: { message: string }) => {
        router.reload({ only: ['investments'] });
        toast.success(event.message);
    };
    useEcho(`investments.${auth.user.id}`, '.investments.created', (event) => { reloadInvestments(event); });
    useEcho(`investments.${auth.user.id}`, '.investments.updated', (event) => { reloadInvestments(event); });
    useEcho(`investments.${auth.user.id}`, '.investments.deleted', (event) => { reloadInvestments(event); });

    function handleDelete(inv: Investment) {
        setDeleting(inv);
    }

    function confirmDelete() {
        if (!deleting) return;
        toast.loading('Processing...');
        router.delete(`/investments/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    const totalValue = investments.reduce((sum, i) => sum + Number(i.current_value), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Investments</h1>
                    <p className="text-muted-foreground text-sm">Track your investment portfolio.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusIcon className="mr-2 h-4 w-4" />Add Investment</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>New Investment</DialogTitle></DialogHeader>
                        <InvestmentForm accounts={accounts} onClose={() => setIsCreateOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <p className="text-muted-foreground text-sm">Total Portfolio Value</p>
                    <CardTitle className="text-3xl">{formatCurrency(totalValue)}</CardTitle>
                </CardHeader>
            </Card>

            {investments.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {investments.map((inv) => {
                        const gain = Number(inv.current_value) - Number(inv.initial_value);
                        const gainPct = Number(inv.initial_value) > 0 ? (gain / Number(inv.initial_value)) * 100 : 0;
                        return (
                            <Card key={inv.id}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div>
                                        <CardTitle className="text-base">{inv.name}</CardTitle>
                                        <p className="text-muted-foreground text-xs">{INVESTMENT_TYPE_LABELS[inv.type]}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setUpdatingId(inv.id)}>Update Value</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setEditing(inv)}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(inv)} className="text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    <div className="text-2xl font-bold">{formatCurrency(inv.current_value)}</div>
                                    <p className={`text-sm ${gain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {gain >= 0 ? '+' : ''}{formatCurrency(gain)} ({gainPct >= 0 ? '+' : ''}{gainPct.toFixed(2)}%)
                                    </p>
                                    {inv.account && <p className="text-muted-foreground text-xs">{inv.account.name}</p>}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <TrendingUpIcon className="text-muted-foreground h-12 w-12" />
                    <div>
                        <p className="font-medium">No investments yet</p>
                        <p className="text-muted-foreground text-sm">Track your shares, bonds, and more.</p>
                    </div>
                </div>
            )}

            <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Edit Investment</DialogTitle></DialogHeader>
                    {editing && <InvestmentForm investment={editing} accounts={accounts} onClose={() => setEditing(null)} />}
                </DialogContent>
            </Dialog>

            <Dialog open={updatingId !== null} onOpenChange={(open) => !open && setUpdatingId(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Update Investment Value</DialogTitle></DialogHeader>
                    {updatingId !== null && <UpdateValueForm investmentId={updatingId} onClose={() => setUpdatingId(null)} />}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={Boolean(deleting)}
                description={`Delete "${deleting?.name}"? All investment history will be removed.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleting(null)}
            />
        </div>
    );
}

InvestmentsIndex.layout = (page: ReactNode) => <AppLayout breadcrumb="Investments">{page}</AppLayout>;
