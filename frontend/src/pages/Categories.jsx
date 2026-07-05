import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaLock, FaTags } from 'react-icons/fa';
import * as categoryService from '../services/categoryService';
import { getIcon } from '../utils/iconMap';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';

const COLORS = ['#6C5CE7', '#00D9A3', '#FF6B6B', '#FFB84D', '#A855F7', '#4ECDC4', '#FF6B9D', '#00B4D8', '#F77F00', '#94A3B8'];
const ICON_OPTIONS = ['FaTag', 'FaUtensils', 'FaCar', 'FaShoppingBag', 'FaFilm', 'FaFileInvoiceDollar', 'FaHeartbeat', 'FaGraduationCap', 'FaPlane', 'FaHome', 'FaMoneyBillWave', 'FaLaptopCode', 'FaChartLine', 'FaGift', 'FaCoins', 'FaEllipsisH'];

export default function Categories() {
  const [tab, setTab] = useState('expense');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm();
  const selectedColor = watch('color');
  const selectedIcon = watch('icon');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getCategories(tab);
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', type: tab, color: COLORS[0], icon: 'FaTag' });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    reset({ name: cat.name, type: cat.type, color: cat.color, icon: cat.icon });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await categoryService.updateCategory(editing._id, data);
        toast.success('Category updated');
      } else {
        await categoryService.createCategory(data);
        toast.success('Category created');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await categoryService.deleteCategory(deleteTarget._id);
      toast.success('Category deleted');
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete this category');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Categories</h2>
          <p className="page-subtitle">Organize your income and expenses.</p>
        </div>
        <button onClick={openCreate} className="btn-primary self-start">
          <FaPlus size={12} /> New Category
        </button>
      </div>

      <div className="inline-flex rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 p-1">
        {['expense', 'income'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
              tab === t ? 'bg-primary-500 text-white shadow-sm' : 'text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card">
          <EmptyState icon={FaTags} title="No categories yet" message={`Create your first ${tab} category.`} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = getIcon(cat.icon);
            return (
              <div key={cat._id} className="glass-card group relative p-5">
                <div
                  className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${cat.color}1A`, color: cat.color }}
                >
                  <Icon size={18} />
                </div>
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{cat.name}</p>
                <p className="text-xs text-ink-400 capitalize">{cat.type}</p>

                {cat.isDefault ? (
                  <div className="absolute right-4 top-4 text-ink-300" title="Default category">
                    <FaLock size={11} />
                  </div>
                ) : (
                  <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => openEdit(cat)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 hover:text-primary-500">
                      <FaEdit size={12} />
                    </button>
                    <button onClick={() => setDeleteTarget(cat)} className="rounded-lg p-1.5 text-ink-400 hover:bg-coral-50 dark:hover:bg-coral-500/10 hover:text-coral-500">
                      <FaTrash size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Name</label>
            <input placeholder="e.g. Groceries" className="input-field" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="mt-1 text-xs text-coral-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label-text">Type</label>
            <select className="input-field" {...register('type', { required: true })}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <label className="label-text">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setValue('color', c)}
                  className={`h-8 w-8 rounded-full transition-transform ${selectedColor === c ? 'ring-2 ring-offset-2 ring-ink-800 dark:ring-white scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input type="hidden" {...register('color')} />
          </div>
          <div>
            <label className="label-text">Icon</label>
            <div className="grid grid-cols-8 gap-2">
              {ICON_OPTIONS.map((iconName) => {
                const Icon = getIcon(iconName);
                return (
                  <button
                    type="button"
                    key={iconName}
                    onClick={() => setValue('icon', iconName)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                      selectedIcon === iconName
                        ? 'border-primary-500 bg-primary-50 text-primary-500 dark:bg-primary-500/10'
                        : 'border-ink-200 dark:border-ink-700 text-ink-400 hover:border-primary-300'
                    }`}
                  >
                    <Icon size={14} />
                  </button>
                );
              })}
            </div>
            <input type="hidden" {...register('icon')} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : editing ? 'Save changes' : 'Create category'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete category?"
        message={`This will permanently delete "${deleteTarget?.name}". Categories with existing transactions can't be deleted.`}
      />
    </div>
  );
}
