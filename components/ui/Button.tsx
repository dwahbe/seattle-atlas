'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variantClasses = {
      primary:
        'bg-[rgb(var(--accent))] text-white hover:bg-[rgb(var(--accent-hover))] focus:ring-[rgb(var(--accent))]',
      secondary:
        'bg-[rgb(var(--secondary-bg))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--secondary-hover))] focus:ring-[rgb(var(--accent))]',
      ghost:
        'text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--secondary-bg))] focus:ring-[rgb(var(--accent))]',
      outline:
        'border border-[rgb(var(--border-color))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--secondary-bg))] focus:ring-[rgb(var(--accent))]',
    };

    const sizeClasses = {
      sm: 'text-xs px-2.5 py-1.5 rounded',
      md: 'text-sm px-4 py-2 rounded-md',
      lg: 'text-base px-6 py-3 rounded-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
