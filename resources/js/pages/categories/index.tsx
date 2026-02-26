import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEcho } from '@laravel/echo-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { type Category } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { MoreHorizontal, PlusIcon, TagIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';

type Props = { categories: Category[] };

const TYPE_LABELS: Record<string, string> = { income: 'Income', expense: 'Expense', both: 'Both' };
const TYPE_COLORS: Record<string, string> = {
    income: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    expense: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    both: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

type CategoryFormProps = { category?: Category; categories: Category[]; onClose: () => void };

function CategoryForm({ category, categories, onClose }: CategoryFormProps) {
    const isEditing = Boolean(category);
    const form = useForm({
        name: category?.name ?? '',
        type: category?.type ?? 'expense',
        parent_id: category?.parent_id ? String(category.parent_id) : '',
        color: category?.color ?? '',
    });

    // Only allow top-level categories as parents (no nested > 2 levels)
    const parentOptions = categories.filter((c) => !c.parent_id && c.id !== category?.id);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload = {
            ...form.data,
            parent_id: form.data.parent_id ? Number(form.data.parent_id) : null,
            color: form.data.color || null,
        };
        if (isEditing && category) {
            router.put(`/categories/${category.id}`, payload, { onSuccess: onClose });
        } else {
            router.post('/categories', payload, { onSuccess: onClose });
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

export default function CategoriesIndex({ categories }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number; permission: string } } }>().props;
    const canEdit = auth.user.permission === 'edit';

    useEcho(`categories.${auth.user.id}`, ['.categories.created', '.categories.updated', '.categories.deleted'], () => router.reload({ only: ['categories'] }));
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [deleting, setDeleting] = useState<Category | null>(null);

    function handleDelete(category: Category) {
        setDeleting(category);
    }

    function confirmDelete() {
        if (!deleting) return;
        router.delete(`/categories/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    const topLevel = categories.filter((c) => !c.parent_id);
    const children = categories.filter((c) => c.parent_id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground text-sm">Manage income and expense categories.</p>
                </div>
                {canEdit && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button><PlusIcon className="mr-2 h-4 w-4" />New Category</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
                            <CategoryForm categories={categories} onClose={() => setIsCreateOpen(false)} />
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">All Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    {categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                            <TagIcon className="text-muted-foreground h-10 w-10" />
                            <p className="text-muted-foreground text-sm">No categories yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Parent</TableHead>
                                    <TableHead>Color</TableHead>
                                    {canEdit && <TableHead className="w-12" />}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...topLevel, ...children].map((cat) => (
                                    <TableRow key={cat.id}>
                                        <TableCell className="font-medium">
                                            {cat.parent_id ? <span className="text-muted-foreground mr-1">└</span> : null}
                                            {cat.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={TYPE_COLORS[cat.type]} variant="secondary">{TYPE_LABELS[cat.type]}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{cat.parent?.name ?? '—'}</TableCell>
                                        <TableCell>
                                            {cat.color ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-4 w-4 rounded-full border" style={{ background: cat.color }} />
                                                    <span className="text-muted-foreground text-xs">{cat.color}</span>
                                                </div>
                                            ) : '—'}
                                        </TableCell>
                                        {canEdit && (
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setEditing(cat)}>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(cat)} className="text-destructive">Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
                    {editing && <CategoryForm category={editing} categories={categories} onClose={() => setEditing(null)} />}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={Boolean(deleting)}
                description={`Delete "${deleting?.name}"? Transactions using this category will become uncategorized.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleting(null)}
            />
        </div>
    );
}

CategoriesIndex.layout = (page: ReactNode) => <AppLayout breadcrumb="Categories">{page}</AppLayout>;
