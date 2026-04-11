'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import type { Theme } from '@/types';

const THEME_STORAGE_KEY = 'civic-atlas-theme';
const THEME_EVENT = 'civic-atlas-theme-change';

// ---------- Pure reads (called during render) ----------

function getStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function getSystemIsDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// ---------- External-store subscriptions ----------

// Stored theme: fires on same-tab THEME_EVENT (setTheme) and cross-tab storage events.
function subscribeStoredTheme(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) onChange();
  };
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

// OS dark-mode preference.
function subscribeSystemTheme(onChange: () => void) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

// Client-mount flag: snapshot flips from `false` (SSR) to `true` (client) via
// React's built-in `getServerSnapshot` handling. No real store behind it.
const noopSubscribe = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

// SSR-safe constant snapshots for `theme` and `systemIsDark`.
const getServerTheme: () => Theme = () => 'system';
const getServerSystemIsDark = () => false;

// ---------- Hook ----------

export function useTheme() {
  const theme = useSyncExternalStore(subscribeStoredTheme, getStoredTheme, getServerTheme);
  const systemIsDark = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemIsDark,
    getServerSystemIsDark
  );
  const mounted = useSyncExternalStore(noopSubscribe, getClientMounted, getServerMounted);

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;

  // Keep the `.dark` class in sync with `resolvedTheme` for the external-trigger
  // cases (OS theme change, other tab). The `mounted` guard prevents the first
  // render (which uses server snapshots) from overwriting the class that the
  // pre-hydration script in app/layout.tsx already set correctly. This effect
  // does not call setState, so it is not flagged by react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [mounted, resolvedTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    // Apply the class synchronously so the toggle feels instant — we don't want
    // to wait for the re-render that useSyncExternalStore will trigger via the
    // dispatched THEME_EVENT below.
    const resolved = newTheme === 'system' ? (getSystemIsDark() ? 'dark' : 'light') : newTheme;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    // Notify same-tab subscribers (useSyncExternalStore) + other tabs via storage.
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

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
