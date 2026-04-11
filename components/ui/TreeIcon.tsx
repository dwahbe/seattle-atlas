interface TreeIconProps {
  className?: string;
}

/**
 * Deciduous/evergreen-style tree icon used for parks throughout the app.
 * Caller provides sizing/color via className.
 */
export function TreeIcon({ className }: TreeIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2 L6 10 L9 10 L5 16 L11 16 L11 22 L13 22 L13 16 L19 16 L15 10 L18 10 Z" />
    </svg>
  );
}
