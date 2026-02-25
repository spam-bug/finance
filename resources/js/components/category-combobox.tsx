import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type Category } from '@/types';
import { cn } from '@/lib/utils';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useState } from 'react';

type Props = {
    categories: Category[];
    value: string; // category id as string, or ''
    onChange: (value: string) => void;
    placeholder?: string;
};

function getCategoryLabel(cat: Category): string {
    return cat.parent ? `${cat.parent.name} › ${cat.name}` : cat.name;
}

export function CategoryCombobox({ categories, value, onChange, placeholder = 'Select category…' }: Props) {
    const [open, setOpen] = useState(false);
    const selected = categories.find((c) => String(c.id) === value);

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
                        <CommandGroup>
                            <CommandItem value="__none" onSelect={() => { onChange(''); setOpen(false); }}>
                                <CheckIcon className={cn('mr-2 h-4 w-4', value === '' ? 'opacity-100' : 'opacity-0')} />
                                None
                            </CommandItem>
                            {categories.map((cat) => {
                                const label = getCategoryLabel(cat);
                                return (
                                    <CommandItem
                                        key={cat.id}
                                        value={label}
                                        onSelect={() => { onChange(String(cat.id)); setOpen(false); }}
                                    >
                                        <CheckIcon className={cn('mr-2 h-4 w-4', value === String(cat.id) ? 'opacity-100' : 'opacity-0')} />
                                        {label}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
