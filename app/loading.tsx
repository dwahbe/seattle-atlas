export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-panel-bg">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-text-secondary">Loading...</p>
      </div>
    </div>
  );
}
