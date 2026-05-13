'use client';

import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';
import { useTheme } from '@/hooks/useTheme';

type ThemeToggleProps = {
  inline?: boolean;
};

export function ThemeToggle({ inline = false }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (inline) {
    return (
      <span className="flex h-[1lh] items-center text-base">
        <button
          onClick={mounted ? toggleTheme : undefined}
          className="touch-target-inline size-[1em] flex-none text-text-secondary hover:text-text-primary transition-colors"
          aria-label={mounted ? `Current theme: ${theme}. Click to toggle.` : 'Toggle Theme'}
          title={mounted ? `Theme: ${theme}` : undefined}
        >
          {mounted && theme === 'light' && <IconSun size="100%" stroke={2} aria-hidden="true" />}
          {mounted && theme === 'dark' && <IconMoon size="100%" stroke={2} aria-hidden="true" />}
          {mounted && theme === 'system' && (
            <IconDeviceDesktop size="100%" stroke={2} aria-hidden="true" />
          )}
        </button>
      </span>
    );
  }

  if (!mounted) {
    return (
      <button
        className="w-9 h-9 flex items-center justify-center rounded-md bg-secondary-bg text-text-secondary border border-border/40"
        aria-label="Toggle Theme"
      >
        <span className="w-4 h-4 block" />
      </button>
    );
  }

  const icons = {
    light: <IconSun size={16} stroke={2} aria-hidden="true" />,
    dark: <IconMoon size={16} stroke={2} aria-hidden="true" />,
    system: <IconDeviceDesktop size={16} stroke={2} aria-hidden="true" />,
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 flex items-center justify-center rounded-md bg-secondary-bg text-text-secondary border border-border/40 hover:text-text-primary hover:bg-secondary-hover transition-colors"
      aria-label={`Current theme: ${theme}. Click to toggle.`}
      title={`Theme: ${theme}`}
    >
      {icons[theme]}
    </button>
  );
}
