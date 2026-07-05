import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  FaPlus, FaSearch, FaEdit, FaTrash, FaArrowDown, FaSort,
} from 'react-icons/fa';
import * as incomeService from '../services/incomeService';
import * as categoryService from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatDateInput } from '../utils/format';
import { getIcon } from '../utils/iconMap';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonRow } from '../components/ui/Skeleton';

export default function Income() {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState([]);
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

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchIncomes = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await incomeService.getIncomes({
          search: search || undefined,
          category: categoryFilter || undefined,
          sortBy: sort.sortBy,
          order: sort.order,
          page,
          limit: pagination.limit,
        });
        setIncomes(res.data);
        setPagination(res.pagination);
      } catch (err) {
        toast.error('Failed to load income entries');
      } finally {
        setLoading(false);
      }
    },
    [search, categoryFilter, sort, pagination.limit]
  );

  useEffect(() => {
    categoryService.getCategories('income').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    fetchIncomes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter, sort]);

  const openCreate = () => {
    setEditing(null);
    reset({ amount: '', source: '', category: categories[0]?._id || '', date: formatDateInput(new Date()), notes: '' });
    setModalOpen(true);
  };

  const openEdit = (income) => {
    setEditing(income);
    reset({
      amount: income.amount,
      source: income.source,
      category: income.category?._id,
      date: formatDateInput(income.date),
      notes: income.notes,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await incomeService.updateIncome(editing._id, data);
        toast.success('Income updated');
      } else {
        await incomeService.createIncome(data);
        toast.success('Income added');
      }
      setModalOpen(false);
      fetchIncomes(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await incomeService.deleteIncome(deleteTarget._id);
      toast.success('Income deleted');
      setDeleteTarget(null);
      fetchIncomes(pagination.page);
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
          <h2 className="page-title">Income</h2>
          <p className="page-subtitle">Track every rupee coming in.</p>
        </div>
        <button onClick={openCreate} className="btn-primary self-start">
          <FaPlus size={12} /> Add Income
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" size={13} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by source..."
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
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 dark:border-ink-800 text-xs uppercase tracking-wide text-ink-400">
                <th className="pb-3 font-semibold">Source</th>
                <th className="pb-3 font-semibold">Category</th>
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
                  <tr key={i}><td colSpan={5}><SkeletonRow /></td></tr>
                ))
              ) : incomes.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon={FaArrowDown} title="No income entries" message="Add your first income entry to get started." />
                  </td>
                </tr>
              ) : (
                incomes.map((income) => {
                  const CategoryIcon = getIcon(income.category?.icon);
                  return (
                    <tr key={income._id} className="group">
                      <td className="py-3 font-medium text-ink-800 dark:text-ink-100">{income.source}</td>
                      <td className="py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: `${income.category?.color}1A`, color: income.category?.color }}
                        >
                          <CategoryIcon size={10} /> {income.category?.name}
                        </span>
                      </td>
                      <td className="py-3 text-ink-500 dark:text-ink-400">{formatDate(income.date)}</td>
                      <td className="py-3 text-right stat-number font-semibold text-mint-600 dark:text-mint-400">
                        +{formatCurrency(income.amount, user?.currency)}
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => openEdit(income)} className="rounded-lg p-2 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 hover:text-primary-500">
                            <FaEdit size={13} />
                          </button>
                          <button onClick={() => setDeleteTarget(income)} className="rounded-lg p-2 text-ink-400 hover:bg-coral-50 dark:hover:bg-coral-500/10 hover:text-coral-500">
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
          onPageChange={(p) => fetchIncomes(p)}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Income' : 'Add Income'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Amount</label>
            <input type="number" step="0.01" className="input-field" {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be greater than 0' } })} />
            {errors.amount && <p className="mt-1 text-xs text-coral-500">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="label-text">Source</label>
            <input placeholder="e.g. Monthly salary" className="input-field" {...register('source', { required: 'Source is required' })} />
            {errors.source && <p className="mt-1 text-xs text-coral-500">{errors.source.message}</p>}
          </div>
          <div>
            <label className="label-text">Category</label>
            <select className="input-field" {...register('category', { required: true })}>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Date</label>
            <input type="date" className="input-field" {...register('date', { required: true })} />
          </div>
          <div>
            <label className="label-text">Notes (optional)</label>
            <textarea rows={2} className="input-field resize-none" {...register('notes')} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : editing ? 'Save changes' : 'Add income'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete income entry?"
        message={`This will permanently delete "${deleteTarget?.source}". This action cannot be undone.`}
      />
    </div>
  );
}
