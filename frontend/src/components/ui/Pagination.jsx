import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Pagination({ page, pages, onPageChange, total, limit }) {
  if (pages <= 1) return null;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-ink-100 dark:border-ink-700 px-1 pt-4">
      <span className="text-xs text-ink-400">
        Showing <span className="font-medium text-ink-600 dark:text-ink-300">{start}-{end}</span> of{' '}
        <span className="font-medium text-ink-600 dark:text-ink-300">{total}</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 dark:border-ink-700 text-ink-500 disabled:opacity-40 hover:bg-ink-50 dark:hover:bg-ink-700"
        >
          <FaChevronLeft size={11} />
        </button>
        <span className="text-xs font-medium text-ink-500 px-1">
          {page} / {pages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 dark:border-ink-700 text-ink-500 disabled:opacity-40 hover:bg-ink-50 dark:hover:bg-ink-700"
        >
          <FaChevronRight size={11} />
        </button>
      </div>
    </div>
  );
}
