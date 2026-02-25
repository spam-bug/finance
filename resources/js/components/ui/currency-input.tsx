import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type ComponentProps } from 'react';

type CurrencyInputProps = Omit<ComponentProps<typeof Input>, 'type'>;

export function CurrencyInput({ className, ...props }: CurrencyInputProps) {
    return (
        <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-3 text-sm text-muted-foreground select-none">₱</span>
            <Input type="number" className={cn('pl-7', className)} {...props} />
        </div>
    );
}
