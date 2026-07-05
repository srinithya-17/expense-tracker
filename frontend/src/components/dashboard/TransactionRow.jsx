import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { getIcon } from '../../utils/iconMap';
import { formatCurrency, formatDate } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';

export default function TransactionRow({ tx }) {
  const { user } = useAuth();
  const CategoryIcon = getIcon(tx.category?.icon);
  const isIncome = tx.type === 'income';

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${tx.category?.color || '#6C5CE7'}1A`, color: tx.category?.color || '#6C5CE7' }}
      >
        <CategoryIcon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{tx.title}</p>
        <p className="text-xs text-ink-400">{tx.category?.name || 'Uncategorized'} · {formatDate(tx.date)}</p>
      </div>
      <div className="flex items-center gap-1.5">
        {isIncome ? (
          <FaArrowDown className="text-mint-500" size={11} />
        ) : (
          <FaArrowUp className="text-coral-500" size={11} />
        )}
        <span className={`stat-number text-sm font-semibold ${isIncome ? 'text-mint-600 dark:text-mint-400' : 'text-coral-600 dark:text-coral-400'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(tx.amount, user?.currency)}
        </span>
      </div>
    </div>
  );
}
