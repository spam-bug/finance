import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PaymentRow } from '@/components/credits/payment-row';
import { formatCurrency, formatDate } from '@/lib/format';
import { type Account, type Credit, type CreditPayment } from '@/types';
import { InfinityIcon, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

function groupByQuarter(payments: CreditPayment[]): CreditPayment[][] {
    const sorted = [...payments].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    const groups: CreditPayment[][] = [];
    for (let i = 0; i < sorted.length; i += 3) {
        groups.push(sorted.slice(i, i + 3));
    }
    return groups;
}

export function CreditCard({ credit, accounts, onDelete }: { credit: Credit & { is_indefinite?: boolean }; accounts: Account[]; onDelete: () => void }) {
    const [expanded, setExpanded] = useState(false);
    const payments = credit.payments ?? [];
    const paidCount = payments.filter((p) => p.paid_at).length;
    const paidAmount = payments.filter((p) => p.paid_at).reduce((sum, p) => sum + Number(p.amount), 0);
    const progress = payments.length > 0 ? (paidCount / payments.length) * 100 : 0;
    const remaining = credit.is_indefinite ? null : Number(credit.total_amount) - paidAmount;

    const nextGenerationHint = (() => {
        if (!credit.is_indefinite) return null;
        const unpaid = payments.filter((p) => !p.paid_at).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        if (unpaid.length === 0) return 'A new payment will be generated automatically.';
        return `Next payment generates after ${formatDate(unpaid[0].due_date)} is paid.`;
    })();

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{credit.name}</CardTitle>
                        {credit.is_indefinite && <Badge variant="secondary" className="flex items-center gap-1"><InfinityIcon className="h-3 w-3" />Indefinite</Badge>}
                    </div>
                    <p className="text-muted-foreground text-sm capitalize">{credit.payment_frequency} · {credit.is_indefinite ? `${paidCount} paid` : `${payments.length} payments`}</p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onDelete} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-3">
                {credit.is_indefinite ? (
                    <>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Paid</span>
                            <span className="font-semibold">{formatCurrency(paidAmount)}</span>
                        </div>
                        {nextGenerationHint && <p className="text-muted-foreground text-xs">{nextGenerationHint}</p>}
                    </>
                ) : (
                    <>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Remaining</span>
                            <span className="font-semibold">{formatCurrency(remaining ?? 0)}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted">
                            <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-muted-foreground text-xs">{paidCount} of {payments.length} paid</p>
                    </>
                )}

                <Button variant="ghost" size="sm" className="w-full" onClick={() => setExpanded(!expanded)}>
                    {expanded ? 'Hide payments' : 'View payment schedule'}
                </Button>

                {expanded && (
                    <div className="space-y-2 pt-1">
                        {credit.payment_frequency === 'quarterly' && credit.divide_into_monthly ? (
                            groupByQuarter(payments).map((group, qi) => (
                                <div key={qi} className="space-y-1">
                                    <p className="text-muted-foreground text-xs font-medium">Quarter {qi + 1}</p>
                                    {group.map((payment) => (
                                        <PaymentRow key={payment.id} payment={payment} accounts={accounts} />
                                    ))}
                                </div>
                            ))
                        ) : (
                            payments.map((payment) => (
                                <PaymentRow key={payment.id} payment={payment} accounts={accounts} />
                            ))
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
