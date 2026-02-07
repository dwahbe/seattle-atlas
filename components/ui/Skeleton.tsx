/**
 * Skeleton loading placeholder.
 *
 * Renders an animated pulse placeholder that matches the shape of content being loaded.
 * Use className to set width, height, and border-radius.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-secondary-bg ${className ?? ''}`}
      aria-hidden="true"
    />
  );
}
