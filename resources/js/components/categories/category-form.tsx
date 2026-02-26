import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Category } from '@/types';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

type CategoryFormProps = { category?: Category; categories: Category[]; onClose: () => void };

export function CategoryForm({ category, categories, onClose }: CategoryFormProps) {
    const isEditing = Boolean(category);
    const form = useForm({
        name: category?.name ?? '',
        type: category?.type ?? 'expense',
        parent_id: category?.parent_id ? String(category.parent_id) : '',
        color: category?.color ?? '',
    });

    const parentOptions = categories.filter((c) => !c.parent_id && c.id !== category?.id);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        toast.loading('Processing...');
        if (isEditing && category) {
            form.transform((data) => ({
                ...data,
                parent_id: data.parent_id ? Number(data.parent_id) : null,
                color: data.color || null,
            })).put(`/categories/${category.id}`, { onSuccess: () => onClose() });
        } else {
            form.transform((data) => ({
                ...data,
                parent_id: data.parent_id ? Number(data.parent_id) : null,
                color: data.color || null,
            })).post('/categories', { onSuccess: () => onClose() });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Groceries" autoFocus />
                {form.errors.name && <p className="text-destructive text-sm">{form.errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={form.data.type} onValueChange={(v) => form.setData('type', v as Category['type'])}>
                        <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex gap-2">
                        <Input
                            id="color"
                            value={form.data.color}
                            onChange={(e) => form.setData('color', e.target.value)}
                            placeholder="#3b82f6"
                            maxLength={7}
                        />
                        {form.data.color && /^#[0-9A-Fa-f]{6}$/.test(form.data.color) && (
                            <div className="h-9 w-9 shrink-0 rounded-md border" style={{ background: form.data.color }} />
                        )}
                    </div>
                    {form.errors.color && <p className="text-destructive text-sm">{form.errors.color}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="parent_id">Parent Category (optional)</Label>
                <Select value={form.data.parent_id} onValueChange={(v) => form.setData('parent_id', v === '__none' ? '' : v)}>
                    <SelectTrigger id="parent_id"><SelectValue placeholder="None (top-level)" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__none">None</SelectItem>
                        {parentOptions.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={form.processing}>{form.processing ? 'Saving…' : isEditing ? 'Save changes' : 'Create category'}</Button>
            </div>
        </form>
    );
}
