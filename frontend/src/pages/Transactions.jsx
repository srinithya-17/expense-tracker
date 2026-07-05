import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaSearch, FaDownload, FaExchangeAlt, FaArrowDown, FaArrowUp, FaSort } from 'react-icons/fa';
import * as transactionService from '../services/transactionService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/format';
import { getIcon } from '../utils/iconMap';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonRow } from '../components/ui/Skeleton';

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState({ sortBy: 'date', order: 'desc' });

  const fetchTransactions = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await transactionService.getTransactions({
          search: search || undefined,
          type: type || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sortBy: sort.sortBy,
          order: sort.order,
          page,
          limit: pagination.limit,
        });
        setTransactions(res.data);
        setPagination(res.pagination);
      } catch (err) {
        toast.error('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    },
    [search, type, startDate, endDate, sort, pagination.limit]
  );

  useEffect(() => {
    fetchTransactions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, type, startDate, endDate, sort]);

  const toggleSort = (field) => {
    setSort((s) => ({
      sortBy: field,
      order: s.sortBy === field && s.order === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleExport = () => {
    const token = localStorage.getItem('token');
    const url = transactionService.exportCSVUrl();
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'transactions.csv';
        link.click();
      })
      .catch(() => toast.error('Export failed'));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Transaction History</h2>
          <p className="page-subtitle">All your income and expenses, unified.</p>
        </div>
        <button onClick={handleExport} className="btn-secondary self-start">
          <FaDownload size={12} /> Export CSV
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" size={13} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="input-field pl-10"
            />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input-field lg:w-40">
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field lg:w-44" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field lg:w-44" />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 dark:border-ink-800 text-xs uppercase tracking-wide text-ink-400">
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Title</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => toggleSort('date')}>
                  <span className="inline-flex items-center gap-1">Date <FaSort size={10} /></span>
                </th>
                <th className="pb-3 font-semibold text-right cursor-pointer select-none" onClick={() => toggleSort('amount')}>
                  <span className="inline-flex items-center gap-1 justify-end w-full">Amount <FaSort size={10} /></span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={5}><SkeletonRow /></td></tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon={FaExchangeAlt} title="No transactions found" message="Try adjusting your filters or add a new income or expense." />
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const CategoryIcon = getIcon(tx.category?.icon);
                  const isIncome = tx.type === 'income';
                  return (
                    <tr key={`${tx.type}-${tx._id}`}>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isIncome ? 'bg-mint-50 text-mint-600 dark:bg-mint-500/10 dark:text-mint-400' : 'bg-coral-50 text-coral-600 dark:bg-coral-500/10 dark:text-coral-400'}`}>
                          {isIncome ? <FaArrowDown size={9} /> : <FaArrowUp size={9} />}
                          {isIncome ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-ink-800 dark:text-ink-100">{tx.title}</td>
                      <td className="py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: `${tx.category?.color}1A`, color: tx.category?.color }}
                        >
                          <CategoryIcon size={10} /> {tx.category?.name}
                        </span>
                      </td>
                      <td className="py-3 text-ink-500 dark:text-ink-400">{formatDate(tx.date)}</td>
                      <td className={`py-3 text-right stat-number font-semibold ${isIncome ? 'text-mint-600 dark:text-mint-400' : 'text-coral-600 dark:text-coral-400'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, user?.currency)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={(p) => fetchTransactions(p)}
        />
      </div>
    </div>
  );
}
