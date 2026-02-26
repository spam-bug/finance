import { useEffect, useState } from 'react';

export type ColorTheme = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'rose';
export type AppearanceMode = 'light' | 'dark' | 'system';

const MODE_KEY = 'app-appearance';
const COLOR_KEY = 'app-color-theme';

function applyTheme(mode: AppearanceMode, color: ColorTheme): void {
    const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const html = document.documentElement;
    html.classList.toggle('dark', isDark);
    html.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-rose');
    if (color !== 'default') {
        html.classList.add(`theme-${color}`);
    }
}

export function useTheme() {
    const [mode, setModeState] = useState<AppearanceMode>(
        () => (localStorage.getItem(MODE_KEY) as AppearanceMode) ?? 'system',
    );
    const [color, setColorState] = useState<ColorTheme>(
        () => (localStorage.getItem(COLOR_KEY) as ColorTheme) ?? 'default',
    );

    useEffect(() => {
        applyTheme(mode, color);
    }, [mode, color]);

    useEffect(() => {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            const currentMode = (localStorage.getItem(MODE_KEY) as AppearanceMode) ?? 'system';
            const currentColor = (localStorage.getItem(COLOR_KEY) as ColorTheme) ?? 'default';
            if (currentMode === 'system') {
                applyTheme('system', currentColor);
            }
        };
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    function setMode(newMode: AppearanceMode): void {
        localStorage.setItem(MODE_KEY, newMode);
        setModeState(newMode);
    }

    function setColor(newColor: ColorTheme): void {
        localStorage.setItem(COLOR_KEY, newColor);
        setColorState(newColor);
    }

    return { mode, color, setMode, setColor };
}
