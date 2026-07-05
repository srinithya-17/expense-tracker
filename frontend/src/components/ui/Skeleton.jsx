export function SkeletonCard() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="h-3 w-20 rounded bg-ink-200 dark:bg-ink-700 mb-3"></div>
      <div className="h-7 w-32 rounded bg-ink-200 dark:bg-ink-700"></div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 animate-pulse">
      <div className="h-9 w-9 rounded-full bg-ink-200 dark:bg-ink-700"></div>
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 rounded bg-ink-200 dark:bg-ink-700"></div>
        <div className="h-2.5 w-1/4 rounded bg-ink-200 dark:bg-ink-700"></div>
      </div>
      <div className="h-4 w-16 rounded bg-ink-200 dark:bg-ink-700"></div>
    </div>
  );
}
