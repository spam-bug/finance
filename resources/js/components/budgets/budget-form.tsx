import { CategoryCombobox } from '@/components/category-combobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Category } from '@/types';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

function getCategoryLabel(category: Category | undefined): string {
    if (!category) return 'Unknown';
    return category.parent ? `${category.parent.name} › ${category.name}` : category.name;
}

export { getCategoryLabel };

export function BudgetForm({ categories, month, year, onClose }: { categories: Category[]; month: number; year: number; onClose: () => void }) {
    const form = useForm({ category_id: '', amount: '', month: String(month), year: String(year) });
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        toast.info('Processing request...');
        form.transform((data) => ({
            ...data,
            category_id: Number(data.category_id),
            month: Number(data.month),
            year: Number(data.year),
        })).post('/budgets', { onSuccess: () => onClose() });
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Category</Label>
                <CategoryCombobox categories={categories} value={form.data.category_id} onChange={(v) => form.setData('category_id', v)} allowNone={false} />
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
