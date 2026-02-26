import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEcho } from '@laravel/echo-react';
import { CreditCard } from '@/components/credits/credit-card';
import { CreditForm } from '@/components/credits/credit-form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { type Account, type Credit } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { CreditCardIcon, PlusIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

type Props = { credits: Credit[]; accounts: Account[] };

export default function CreditsIndex({ credits, accounts }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deleting, setDeleting] = useState<Credit | null>(null);

    const reloadCredits = (event: { message: string }) => {
        router.reload({ only: ['credits'] });
        toast.success(event.message);
    };
    useEcho(`credits.${auth.user.id}`, '.credits.created', (event) => { reloadCredits(event); });
    useEcho(`credits.${auth.user.id}`, '.credits.deleted', (event) => { reloadCredits(event); });
    useEcho(`credits.${auth.user.id}`, '.credits.payment-paid', (event) => { reloadCredits(event); });

    function handleDelete(credit: Credit) {
        setDeleting(credit);
    }

    function confirmDelete() {
        if (!deleting) return;
        toast.loading('Processing...');
        router.delete(`/credits/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Credits</h1>
                    <p className="text-muted-foreground text-sm">Track loans and payment schedules.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusIcon className="mr-2 h-4 w-4" />Add Credit</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader><DialogTitle>New Credit</DialogTitle></DialogHeader>
                        <CreditForm onClose={() => setIsCreateOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            {credits.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {credits.map((credit) => (
                        <CreditCard key={credit.id} credit={credit} accounts={accounts} onDelete={() => handleDelete(credit)} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <CreditCardIcon className="text-muted-foreground h-12 w-12" />
                    <div>
                        <p className="font-medium">No credits yet</p>
                        <p className="text-muted-foreground text-sm">Add a loan or credit to track payments.</p>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={Boolean(deleting)}
                description={`Delete "${deleting?.name}"? All payment records will be removed.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleting(null)}
            />
        </div>
    );
}

CreditsIndex.layout = (page: ReactNode) => <AppLayout breadcrumb="Credits">{page}</AppLayout>;
