import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { FaPiggyBank, FaPercentage, FaWallet } from 'react-icons/fa';
import * as dashboardService from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import { SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const RANGE_OPTIONS = [
  { label: '3M', value: 3 },
  { label: '6M', value: 6 },
  { label: '12M', value: 12 },
];

export default function Analysis() {
  const { user } = useAuth();
  const [months, setMonths] = useState(6);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dashboardService
      .getAnalysis(months)
      .then(setData)
      .catch(() => toast.error('Failed to load analysis'))
      .finally(() => setLoading(false));
  }, [months]);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const hasCategoryData = data.categorySpending.length > 0;
  const hasTrendData = data.monthlyTrends.some((m) => m.income > 0 || m.expense > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Analysis</h2>
          <p className="page-subtitle">Understand your spending patterns and trends.</p>
        </div>
        <div className="inline-flex rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 p-1 self-start">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMonths(opt.value)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                months === opt.value ? 'bg-primary-500 text-white shadow-sm' : 'text-ink-500 hover:text-ink-800 dark:hover:text-ink-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Savings summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-50 text-mint-500 dark:bg-mint-500/10">
              <FaPiggyBank size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-ink-400">Total Savings</p>
              <p className="stat-number text-lg text-ink-900 dark:text-white">{formatCurrency(data.savingsAnalysis.totalSavings, user?.currency)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-500/10">
              <FaPercentage size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-ink-400">Savings Rate</p>
              <p className="stat-number text-lg text-ink-900 dark:text-white">{data.savingsAnalysis.savingsRate}%</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-50 text-gold-500 dark:bg-gold-500/10">
              <FaWallet size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-ink-400">Total Spent</p>
              <p className="stat-number text-lg text-ink-900 dark:text-white">{formatCurrency(data.savingsAnalysis.totalExpense, user?.currency)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar chart: monthly income vs expense */}
        <div className="glass-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink-800 dark:text-ink-100">Monthly Income vs Expense</h3>
          {hasTrendData ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.monthlyTrends} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-ink-100 dark:text-ink-800" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#8B93A7" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} stroke="#8B93A7" axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => formatCurrency(v, user?.currency)} contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="income" fill="#00D9A3" radius={[6, 6, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#FF6B6B" radius={[6, 6, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Not enough data" message="Add income and expenses to see this chart." />
          )}
        </div>

        {/* Pie chart: category-wise spending */}
        <div className="glass-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-ink-800 dark:text-ink-100">Category-wise Spending</h3>
          {hasCategoryData ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.categorySpending}
                  dataKey="total"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {data.categorySpending.map((entry, index) => (
                    <Cell key={index} fill={entry.color || '#6C5CE7'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v, user?.currency)} contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No expenses yet" message="Add expenses to see category breakdown." />
          )}
        </div>

        {/* Line chart: savings trend */}
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-ink-800 dark:text-ink-100">Savings Trend</h3>
          {hasTrendData ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.monthlyTrends} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-ink-100 dark:text-ink-800" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#8B93A7" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} stroke="#8B93A7" axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => formatCurrency(v, user?.currency)} contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                <Line type="monotone" dataKey="savings" stroke="#6C5CE7" strokeWidth={2.5} dot={{ r: 4, fill: '#6C5CE7' }} name="Savings" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Not enough data" message="Your savings trend will appear here once you track income and expenses." />
          )}
        </div>

        {/* Weekly expenses bar */}
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold text-ink-800 dark:text-ink-100">Weekly Spending (Last 8 Weeks)</h3>
          {data.weeklyExpenses.some((w) => w.total > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.weeklyExpenses} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="text-ink-100 dark:text-ink-800" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#8B93A7" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} stroke="#8B93A7" axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => formatCurrency(v, user?.currency)} contentStyle={{ borderRadius: 12, border: 'none', fontSize: 12 }} />
                <Bar dataKey="total" fill="#FFB84D" radius={[6, 6, 0, 0]} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No recent spending" message="Weekly trends will show up once you log expenses." />
          )}
        </div>
      </div>
    </div>
  );
}
