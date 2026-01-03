'use client';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
}

export function Switch({ checked, onChange, label, id }: SwitchProps) {
  const switchId = id || `switch-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <button
      type="button"
      role="switch"
      id={switchId}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5
        transition-colors duration-200 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2
        ${checked ? 'bg-[rgb(var(--accent))]' : 'bg-[rgb(var(--border-color))]'}
      `}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full
          bg-white shadow-md ring-0 transition duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
      {label && <span className="ml-3 text-sm text-[rgb(var(--text-primary))]">{label}</span>}
    </button>
  );
}
