export type Theme = 'light' | 'dark';

export function getStoredTheme(): Theme | null {
  try { return localStorage.getItem('theme') as Theme | null; } catch { return null; }
}

export function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function persistTheme(theme: Theme) {
  try { localStorage.setItem('theme', theme); } catch {}
  applyTheme(theme);
}
