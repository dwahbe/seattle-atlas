import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[rgb(var(--panel-bg))]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-[rgb(var(--secondary-bg))] rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-[rgb(var(--text-secondary))]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2M9 9h.01M15 9h.01" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-3">Page not found</h1>
        <p className="text-[rgb(var(--text-secondary))] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/map">
          <Button variant="primary" size="lg">
            Go to Map
          </Button>
        </Link>
      </div>
    </div>
  );
}
