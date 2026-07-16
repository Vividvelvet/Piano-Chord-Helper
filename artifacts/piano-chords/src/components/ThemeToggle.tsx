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
      className="fixed bottom-5 right-5 z-50 w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-200 hover:shadow-[0_0_12px_rgba(217,119,6,0.15)]"
    >
      {theme === 'dark'
        ? <Sun className="w-4 h-4" />
        : <Moon className="w-4 h-4" />
      }
    </button>
  );
}
