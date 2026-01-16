'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Theme } from '@/types';

const THEME_STORAGE_KEY = 'civic-atlas-theme';
const THEME_EVENT = 'civic-atlas-theme-change';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;

  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;

  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const applyThemeState = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    const resolved = nextTheme === 'system' ? getSystemTheme() : nextTheme;
    setResolvedTheme(resolved);
    applyTheme(nextTheme);
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    const storedTheme = getStoredTheme();
    applyThemeState(storedTheme);
    setMounted(true);
  }, [applyThemeState]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        const newResolved = getSystemTheme();
        setResolvedTheme(newResolved);
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      applyThemeState(newTheme);
      window.dispatchEvent(new Event(THEME_EVENT));
    },
    [applyThemeState]
  );

  useEffect(() => {
    if (!mounted) return;

    const handleThemeChange = () => {
      const storedTheme = getStoredTheme();
      applyThemeState(storedTheme);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        handleThemeChange();
      }
    };

    window.addEventListener(THEME_EVENT, handleThemeChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(THEME_EVENT, handleThemeChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [applyThemeState, mounted]);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(nextTheme);
  }, [theme, setTheme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    mounted,
  };
}
