import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type Category } from '@/types';
import { cn } from '@/lib/utils';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useState } from 'react';

type Props = {
    categories: Category[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    allowNone?: boolean;
};

function getCategoryLabel(cat: Category): string {
    return cat.parent ? `${cat.parent.name} › ${cat.name}` : cat.name;
}

export function CategoryCombobox({ categories, value, onChange, placeholder = 'Select category…', allowNone = true }: Props) {
    const [open, setOpen] = useState(false);
    const selected = categories.find((c) => String(c.id) === value);

    // Build grouped structure
    const topLevel = categories.filter((c) => !c.parent_id);
    const childrenByParentId = new Map<number, Category[]>();
    categories
        .filter((c) => c.parent_id)
        .forEach((c) => {
            const arr = childrenByParentId.get(c.parent_id!) ?? [];
            arr.push(c);
            childrenByParentId.set(c.parent_id!, arr);
        });

    // Top-level cats that have children in this list → group headers
    const parents = topLevel.filter((c) => childrenByParentId.has(c.id));
    // Top-level cats with no children in this list → standalone
    const standalone = topLevel.filter((c) => !childrenByParentId.has(c.id));
    // Children whose parent is NOT in the top-level list → show with prefix
    const orphans = categories.filter((c) => c.parent_id && !topLevel.some((t) => t.id === c.parent_id));

    function select(id: string) {
        onChange(id);
        setOpen(false);
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
                    {selected ? getCategoryLabel(selected) : <span className="text-muted-foreground">{placeholder}</span>}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search categories…" />
                    <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>

                        {allowNone && (
                            <CommandGroup>
                                <CommandItem value="__none" onSelect={() => select('')}>
                                    <CheckIcon className={cn('mr-2 h-4 w-4', value === '' ? 'opacity-100' : 'opacity-0')} />
                                    None
                                </CommandItem>
                            </CommandGroup>
                        )}

                        {standalone.length > 0 && (
                            <>
                                {allowNone && <CommandSeparator />}
                                <CommandGroup>
                                    {standalone.map((cat) => (
                                        <CommandItem key={cat.id} value={cat.name} onSelect={() => select(String(cat.id))}>
                                            <CheckIcon className={cn('mr-2 h-4 w-4', value === String(cat.id) ? 'opacity-100' : 'opacity-0')} />
                                            {cat.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}

                        {parents.map((parent, i) => (
                            <div key={parent.id}>
                                {(standalone.length > 0 || allowNone || i > 0) && <CommandSeparator />}
                                <CommandGroup heading={parent.name}>
                                    {/* Parent itself as selectable item */}
                                    <CommandItem value={parent.name} onSelect={() => select(String(parent.id))}>
                                        <CheckIcon className={cn('mr-2 h-4 w-4', value === String(parent.id) ? 'opacity-100' : 'opacity-0')} />
                                        {parent.name} (all)
                                    </CommandItem>
                                    {(childrenByParentId.get(parent.id) ?? []).map((child) => (
                                        <CommandItem key={child.id} value={`${parent.name} ${child.name}`} onSelect={() => select(String(child.id))}>
                                            <CheckIcon className={cn('mr-2 h-4 w-4', value === String(child.id) ? 'opacity-100' : 'opacity-0')} />
                                            {child.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </div>
                        ))}

                        {orphans.length > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    {orphans.map((cat) => (
                                        <CommandItem key={cat.id} value={getCategoryLabel(cat)} onSelect={() => select(String(cat.id))}>
                                            <CheckIcon className={cn('mr-2 h-4 w-4', value === String(cat.id) ? 'opacity-100' : 'opacity-0')} />
                                            {getCategoryLabel(cat)}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
