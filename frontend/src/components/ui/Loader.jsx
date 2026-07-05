export default function Loader({ full = false, label = 'Loading' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${full ? 'min-h-[60vh]' : 'py-10'}`}>
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
      <span className="text-sm text-ink-400">{label}...</span>
    </div>
  );
}
