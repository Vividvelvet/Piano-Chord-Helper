import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { getStoredTheme, getSystemTheme, applyTheme, persistTheme, type Theme } from '@/lib/theme';

export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const t = getStoredTheme() ?? getSystemTheme();
    setThemeState(t);
    applyTheme(t);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    persistTheme(next);
    setThemeState(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/8 border border-transparent hover:border-border transition-all duration-200"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
