export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-500">
          <Icon size={28} />
        </div>
      )}
      <h3 className="text-base font-semibold text-ink-800 dark:text-ink-100">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm text-ink-400">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
