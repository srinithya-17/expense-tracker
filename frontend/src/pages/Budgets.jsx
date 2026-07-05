import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaWallet, FaExclamationTriangle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import * as budgetService from '../services/budgetService';
import * as categoryService from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import { getIcon } from '../utils/iconMap';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Budgets() {
  const { user } = useAuth();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const data = await budgetService.getBudgets(cursor.month, cursor.year);
      setBudgets(data);
    } catch (err) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoryService.getCategories('expense').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor]);

  const shiftMonth = (delta) => {
    setCursor((c) => {
      let month = c.month + delta;
      let year = c.year;
      if (month > 12) { month = 1; year += 1; }
      if (month < 1) { month = 12; year -= 1; }
      return { month, year };
    });
  };

  const openCreate = () => {
    setEditing(null);
    reset({ category: '', amount: '', month: cursor.month, year: cursor.year, alertThreshold: 80 });
    setModalOpen(true);
  };

  const openEdit = (budget) => {
    setEditing(budget);
    reset({
      category: budget.category?._id || '',
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
      alertThreshold: budget.alertThreshold,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, category: data.category || null };
      if (editing) {
        await budgetService.updateBudget(editing._id, payload);
        toast.success('Budget updated');
      } else {
        await budgetService.createBudget(payload);
        toast.success('Budget created');
      }
      setModalOpen(false);
      fetchBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'A budget for this category/month may already exist');
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await budgetService.deleteBudget(deleteTarget._id);
      toast.success('Budget removed');
      setDeleteTarget(null);
      fetchBudgets();
    } catch (err) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Budgets</h2>
          <p className="page-subtitle">Set limits and stay in control of your spending.</p>
        </div>
        <button onClick={openCreate} className="btn-primary self-start">
          <FaPlus size={12} /> New Budget
        </button>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button onClick={() => shiftMonth(-1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 dark:border-ink-700 text-ink-500 hover:bg-ink-50 dark:hover:bg-ink-800">
          <FaChevronLeft size={12} />
        </button>
        <span className="min-w-[160px] text-center text-sm font-semibold text-ink-800 dark:text-ink-100">
          {MONTH_NAMES[cursor.month - 1]} {cursor.year}
        </span>
        <button onClick={() => shiftMonth(1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 dark:border-ink-700 text-ink-500 hover:bg-ink-50 dark:hover:bg-ink-800">
          <FaChevronRight size={12} />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="glass-card">
          <EmptyState icon={FaWallet} title="No budgets for this month" message="Create a budget to track your spending against a limit." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => {
            const Icon = b.category ? getIcon(b.category.icon) : FaWallet;
            const color = b.isExceeded ? '#FF6B6B' : b.isNearLimit ? '#FFB84D' : '#00D9A3';
            return (
              <div key={b._id} className="glass-card group relative p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${b.category?.color || '#6C5CE7'}1A`, color: b.category?.color || '#6C5CE7' }}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => openEdit(b)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 hover:text-primary-500">
                      <FaEdit size={12} />
                    </button>
                    <button onClick={() => setDeleteTarget(b)} className="rounded-lg p-1.5 text-ink-400 hover:bg-coral-50 dark:hover:bg-coral-500/10 hover:text-coral-500">
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">
                  {b.category?.name || 'Overall Monthly Budget'}
                </p>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="stat-number text-lg text-ink-900 dark:text-white">{formatCurrency(b.spent, user?.currency)}</span>
                  <span className="text-xs text-ink-400">of {formatCurrency(b.amount, user?.currency)}</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-ink-100 dark:bg-ink-700 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(b.percentage, 100)}%`, backgroundColor: color }}
                  />
                </div>
                {(b.isExceeded || b.isNearLimit) && (
                  <p className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${b.isExceeded ? 'text-coral-500' : 'text-gold-500'}`}>
                    <FaExclamationTriangle size={11} />
                    {b.isExceeded ? 'Budget exceeded' : `${b.percentage}% of budget used`}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Budget' : 'New Budget'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Category (leave blank for overall budget)</label>
            <select className="input-field" {...register('category')}>
              <option value="">Overall monthly budget</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Budget amount</label>
            <input type="number" step="0.01" className="input-field" {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be greater than 0' } })} />
            {errors.amount && <p className="mt-1 text-xs text-coral-500">{errors.amount.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Month</label>
              <select className="input-field" {...register('month', { required: true, valueAsNumber: true })}>
                {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Year</label>
              <input type="number" className="input-field" {...register('year', { required: true, valueAsNumber: true })} />
            </div>
          </div>
          <div>
            <label className="label-text">Alert threshold (%)</label>
            <input type="number" min="1" max="100" className="input-field" {...register('alertThreshold', { valueAsNumber: true })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : editing ? 'Save changes' : 'Create budget'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete budget?"
        message="This will remove the budget for this category and month."
      />
    </div>
  );
}
