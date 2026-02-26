import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

type UpdateFormProps = { investmentId: number; onClose: () => void };

export function UpdateValueForm({ investmentId, onClose }: UpdateFormProps) {
    const form = useForm({ value: '', date: new Date().toISOString().split('T')[0], notes: '' });
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        toast.info('Processing request...');
        form.post(`/investments/${investmentId}/updates`, { onSuccess: () => onClose() });
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
