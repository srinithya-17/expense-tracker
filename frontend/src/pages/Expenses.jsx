import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  FaPlus, FaSearch, FaEdit, FaTrash, FaArrowUp, FaSort, FaPaperclip, FaReceipt,
} from 'react-icons/fa';
import * as expenseService from '../services/expenseService';
import * as categoryService from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatDateInput } from '../utils/format';
import { getIcon } from '../utils/iconMap';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonRow } from '../components/ui/Skeleton';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'other', label: 'Other' },
];

export default function Expenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 8 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState({ sortBy: 'date', order: 'desc' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchExpenses = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await expenseService.getExpenses({
          search: search || undefined,
          category: categoryFilter || undefined,
          sortBy: sort.sortBy,
          order: sort.order,
          page,
          limit: pagination.limit,
        });
        setExpenses(res.data);
        setPagination(res.pagination);
      } catch (err) {
        toast.error('Failed to load expenses');
      } finally {
        setLoading(false);
      }
    },
    [search, categoryFilter, sort, pagination.limit]
  );

  useEffect(() => {
    categoryService.getCategories('expense').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    fetchExpenses(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter, sort]);

  const openCreate = () => {
    setEditing(null);
    setReceiptFile(null);
    reset({ amount: '', title: '', category: categories[0]?._id || '', paymentMethod: 'cash', date: formatDateInput(new Date()), notes: '' });
    setModalOpen(true);
  };

  const openEdit = (expense) => {
    setEditing(expense);
    setReceiptFile(null);
    reset({
      amount: expense.amount,
      title: expense.title,
      category: expense.category?._id,
      paymentMethod: expense.paymentMethod,
      date: formatDateInput(expense.date),
      notes: expense.notes,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, receipt: receiptFile };
      if (editing) {
        await expenseService.updateExpense(editing._id, payload);
        toast.success('Expense updated');
      } else {
        await expenseService.createExpense(payload);
        toast.success('Expense added');
      }
      setModalOpen(false);
      fetchExpenses(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await expenseService.deleteExpense(deleteTarget._id);
      toast.success('Expense deleted');
      setDeleteTarget(null);
      fetchExpenses(pagination.page);
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSort = (field) => {
    setSort((s) => ({
      sortBy: field,
      order: s.sortBy === field && s.order === 'desc' ? 'asc' : 'desc',
    }));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Expenses</h2>
          <p className="page-subtitle">Every rupee spent, organized.</p>
        </div>
        <button onClick={openCreate} className="btn-primary self-start">
          <FaPlus size={12} /> Add Expense
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" size={13} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field sm:w-52"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 dark:border-ink-800 text-xs uppercase tracking-wide text-ink-400">
                <th className="pb-3 font-semibold">Title</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Payment</th>
                <th className="pb-3 font-semibold cursor-pointer select-none" onClick={() => toggleSort('date')}>
                  <span className="inline-flex items-center gap-1">Date <FaSort size={10} /></span>
                </th>
                <th className="pb-3 font-semibold text-right cursor-pointer select-none" onClick={() => toggleSort('amount')}>
                  <span className="inline-flex items-center gap-1 justify-end w-full">Amount <FaSort size={10} /></span>
                </th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}><td colSpan={6}><SkeletonRow /></td></tr>
                ))
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon={FaArrowUp} title="No expenses yet" message="Add your first expense to start tracking your spending." />
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => {
                  const CategoryIcon = getIcon(expense.category?.icon);
                  return (
                    <tr key={expense._id} className="group">
                      <td className="py-3 font-medium text-ink-800 dark:text-ink-100">
                        <div className="flex items-center gap-2">
                          {expense.title}
                          {expense.receipt && (
                            <a href={expense.receipt} target="_blank" rel="noreferrer" className="text-ink-300 hover:text-primary-500">
                              <FaPaperclip size={11} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: `${expense.category?.color}1A`, color: expense.category?.color }}
                        >
                          <CategoryIcon size={10} /> {expense.category?.name}
                        </span>
                      </td>
                      <td className="py-3 text-ink-500 dark:text-ink-400 capitalize">{expense.paymentMethod?.replace('_', ' ')}</td>
                      <td className="py-3 text-ink-500 dark:text-ink-400">{formatDate(expense.date)}</td>
                      <td className="py-3 text-right stat-number font-semibold text-coral-600 dark:text-coral-400">
                        -{formatCurrency(expense.amount, user?.currency)}
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => openEdit(expense)} className="rounded-lg p-2 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 hover:text-primary-500">
                            <FaEdit size={13} />
                          </button>
                          <button onClick={() => setDeleteTarget(expense)} className="rounded-lg p-2 text-ink-400 hover:bg-coral-50 dark:hover:bg-coral-500/10 hover:text-coral-500">
                            <FaTrash size={13} />
                          </button>
                        </div>
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
          onPageChange={(p) => fetchExpenses(p)}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Amount</label>
            <input type="number" step="0.01" className="input-field" {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be greater than 0' } })} />
            {errors.amount && <p className="mt-1 text-xs text-coral-500">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="label-text">Title</label>
            <input placeholder="e.g. Grocery shopping" className="input-field" {...register('title', { required: 'Title is required' })} />
            {errors.title && <p className="mt-1 text-xs text-coral-500">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Category</label>
              <select className="input-field" {...register('category', { required: true })}>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Payment method</label>
              <select className="input-field" {...register('paymentMethod')}>
                {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label-text">Date</label>
            <input type="date" className="input-field" {...register('date', { required: true })} />
          </div>
          <div>
            <label className="label-text">Receipt (optional)</label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-ink-300 dark:border-ink-600 px-4 py-3 text-sm text-ink-400 hover:border-primary-400 hover:text-primary-500">
              <FaReceipt size={14} />
              {receiptFile ? receiptFile.name : editing?.receipt ? 'Replace existing receipt' : 'Upload receipt image'}
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setReceiptFile(e.target.files[0])} />
            </label>
          </div>
          <div>
            <label className="label-text">Notes (optional)</label>
            <textarea rows={2} className="input-field resize-none" {...register('notes')} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : editing ? 'Save changes' : 'Add expense'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete expense?"
        message={`This will permanently delete "${deleteTarget?.title}". This action cannot be undone.`}
      />
    </div>
  );
}
