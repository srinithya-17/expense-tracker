import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaWallet, FaArrowDown, FaArrowUp, FaPiggyBank, FaPlus, FaChartLine, FaExchangeAlt,
} from 'react-icons/fa';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import * as dashboardService from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import StatCard from '../components/dashboard/StatCard';
import TransactionRow from '../components/dashboard/TransactionRow';
import ProgressBar from '../components/ui/ProgressBar';
import { SkeletonCard, SkeletonRow } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [summaryData, analysisData] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getAnalysis(6),
        ]);
        setSummary(summaryData);
        setTrend(analysisData.monthlyTrends);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="glass-card p-5">
          {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    );
  }

  const budgetColor =
    summary.budgetProgress >= 100 ? 'bg-coral-500' : summary.budgetProgress >= 80 ? 'bg-gold-500' : 'bg-mint-500';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome + quick actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="page-title">Hey {user?.name?.split(' ')[0]}, here's your overview</h2>
          <p className="page-subtitle">Here's what's happening with your money this month.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/income" className="btn-secondary">
            <FaPlus size={12} /> Income
          </Link>
          <Link to="/expenses" className="btn-primary">
            <FaPlus size={12} /> Expense
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Balance"
          value={formatCurrency(summary.totalBalance, user?.currency)}
          icon={FaWallet}
          tone="primary"
          delay={0}
        />
        <StatCard
          label="Total Income"
          value={formatCurrency(summary.totalIncome, user?.currency)}
          icon={FaArrowDown}
          tone="mint"
          delay={0.05}
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(summary.totalExpenses, user?.currency)}
          icon={FaArrowUp}
          tone="coral"
          delay={0.1}
        />
        <StatCard
          label="Savings"
          value={formatCurrency(summary.savings, user?.currency)}
          icon={FaPiggyBank}
          tone="gold"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trend chart */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Income vs Expense</h3>
              <p className="text-xs text-ink-400">Last 6 months</p>
            </div>
            <Link to="/analysis" className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600">
              Full analysis <FaChartLine size={10} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D9A3" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#00D9A3" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B6B" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#FF6B6B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-ink-100 dark:text-ink-800" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#8B93A7" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} stroke="#8B93A7" axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 32px rgba(15,17,26,0.12)', fontSize: 12 }}
                formatter={(value) => formatCurrency(value, user?.currency)}
              />
              <Area type="monotone" dataKey="income" stroke="#00D9A3" fill="url(#incomeGrad)" strokeWidth={2} name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#FF6B6B" fill="url(#expenseGrad)" strokeWidth={2} name="Expense" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Budget progress */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Monthly Budget</h3>
          <p className="text-xs text-ink-400 mb-4">This month's spending limit</p>

          {summary.monthlyBudget > 0 ? (
            <>
              <div className="flex items-baseline justify-between">
                <span className="stat-number text-xl text-ink-900 dark:text-white">
                  {formatCurrency(summary.monthExpenses, user?.currency)}
                </span>
                <span className="text-xs text-ink-400">
                  of {formatCurrency(summary.monthlyBudget, user?.currency)}
                </span>
              </div>
              <div className="mt-3">
                <ProgressBar percentage={summary.budgetProgress} colorClass={budgetColor} height="h-2.5" />
              </div>
              <p className="mt-3 text-xs text-ink-400">
                {summary.remainingBudget >= 0
                  ? `${formatCurrency(summary.remainingBudget, user?.currency)} remaining`
                  : `${formatCurrency(Math.abs(summary.remainingBudget), user?.currency)} over budget`}
              </p>
            </>
          ) : (
            <EmptyState
              icon={FaWallet}
              title="No budget set"
              message="Set a monthly budget to track your spending limit."
              action={<Link to="/budgets" className="btn-primary text-xs">Set budget</Link>}
            />
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="glass-card p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Recent Transactions</h3>
          <Link to="/transactions" className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600">
            View all <FaExchangeAlt size={10} />
          </Link>
        </div>
        {summary.recentTransactions.length === 0 ? (
          <EmptyState
            icon={FaExchangeAlt}
            title="No transactions yet"
            message="Add your first income or expense to see it here."
          />
        ) : (
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {summary.recentTransactions.map((tx) => (
              <TransactionRow key={`${tx.type}-${tx._id}`} tx={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
