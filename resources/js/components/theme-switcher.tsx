import {
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { type AppearanceMode, type ColorTheme, useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { Monitor, Moon, Palette, Sun } from 'lucide-react';

const COLOR_OPTIONS: { value: ColorTheme; label: string; swatch: string }[] = [
    { value: 'default', label: 'Default', swatch: 'bg-zinc-900 dark:bg-zinc-100' },
    { value: 'blue', label: 'Blue', swatch: 'bg-blue-600' },
    { value: 'green', label: 'Green', swatch: 'bg-green-600' },
    { value: 'purple', label: 'Purple', swatch: 'bg-purple-600' },
    { value: 'orange', label: 'Orange', swatch: 'bg-orange-500' },
    { value: 'rose', label: 'Rose', swatch: 'bg-rose-600' },
];

export function ThemeSwitcher() {
    const { mode, color, setMode, setColor } = useTheme();

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Palette className="size-4" />
                Appearance
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-48">
                    <DropdownMenuRadioGroup value={mode} onValueChange={(v) => setMode(v as AppearanceMode)}>
                        <DropdownMenuRadioItem value="light">
                            <Sun className="size-4" />
                            Light
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="dark">
                            <Moon className="size-4" />
                            Dark
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="system">
                            <Monitor className="size-4" />
                            System
                        </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <div className="bg-border -mx-1 my-1 h-px" />
                    <div className="px-2 py-1.5">
                        <p className="text-muted-foreground mb-2 text-xs font-medium">Color</p>
                        <div className="flex flex-wrap gap-1.5">
                            {COLOR_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    title={option.label}
                                    onClick={() => setColor(option.value)}
                                    className={cn(
                                        'h-5 w-5 cursor-pointer rounded-full ring-offset-background transition-all',
                                        option.swatch,
                                        color === option.value
                                            ? 'ring-2 ring-foreground ring-offset-2'
                                            : 'opacity-70 hover:opacity-100',
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    );
}
