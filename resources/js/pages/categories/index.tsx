import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEcho } from '@laravel/echo-react';
import { CategoryForm } from '@/components/categories/category-form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { type Category } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { MoreHorizontal, PlusIcon, TagIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';

type Props = { categories: Category[] };

const TYPE_LABELS: Record<string, string> = { income: 'Income', expense: 'Expense', both: 'Both' };
const TYPE_COLORS: Record<string, string> = {
    income: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    expense: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    both: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export default function CategoriesIndex({ categories }: Props) {
    const { auth } = usePage<{ auth: { user: { id: number; permission: string } } }>().props;
    const canEdit = auth.user.permission === 'edit';

    const reloadCategories = (event: { message: string }) => {
        router.reload({ only: ['categories'] })
        toast.success(event.message)
    }
    useEcho(`categories.${auth.user.id}`, '.categories.created', (event) => { reloadCategories(event) })
    useEcho(`categories.${auth.user.id}`, '.categories.updated', (event) => { reloadCategories(event)  })
    useEcho(`categories.${auth.user.id}`, '.categories.deleted', (event) => { reloadCategories(event) })
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [deleting, setDeleting] = useState<Category | null>(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    function handleDelete(category: Category) {
        setDeleting(category);
    }

    function confirmDelete() {
        if (!deleting) return;
        toast.loading('Processing...');
        router.delete(`/categories/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    const filtered = categories.filter((c) => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || (c.parent?.name ?? '').toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || c.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const topLevel = filtered.filter((c) => !c.parent_id);
    const children = filtered.filter((c) => c.parent_id);

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
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-base">All Categories</CardTitle>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Search categories…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-8 w-48"
                            />
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All types</SelectItem>
                                    <SelectItem value="income">Income</SelectItem>
                                    <SelectItem value="expense">Expense</SelectItem>
                                    <SelectItem value="both">Both</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                            <TagIcon className="text-muted-foreground h-10 w-10" />
                            <p className="text-muted-foreground text-sm">No categories yet.</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className="text-muted-foreground py-8 text-center text-sm">No categories match your search.</p>
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
