export default function ProgressBar({ percentage = 0, colorClass = 'bg-primary-500', height = 'h-2' }) {
  const clamped = Math.min(Math.max(percentage, 0), 100);
  return (
    <div className={`w-full ${height} rounded-full bg-ink-100 dark:bg-ink-700 overflow-hidden`}>
      <div
        className={`${height} rounded-full ${colorClass} transition-all duration-700 ease-out`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
