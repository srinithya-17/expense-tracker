import { NavLink } from 'react-router-dom';
import {
  FaChartPie, FaArrowDown, FaArrowUp, FaTags, FaWallet,
  FaExchangeAlt, FaChartLine, FaUserCircle, FaCoins,
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const links = [
  { to: '/', label: 'Dashboard', icon: FaChartPie, end: true },
  { to: '/income', label: 'Income', icon: FaArrowDown },
  { to: '/expenses', label: 'Expenses', icon: FaArrowUp },
  { to: '/categories', label: 'Categories', icon: FaTags },
  { to: '/budgets', label: 'Budgets', icon: FaWallet },
  { to: '/transactions', label: 'Transactions', icon: FaExchangeAlt },
  { to: '/analysis', label: 'Analysis', icon: FaChartLine },
  { to: '/profile', label: 'Profile', icon: FaUserCircle },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-ink-950/40 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-ink-100 dark:border-ink-800 bg-white/80 dark:bg-ink-900/80 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2.5 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-mint-500 text-white shadow-glow">
            <FaCoins size={16} />
          </div>
          <span className="text-lg font-bold tracking-tight text-ink-900 dark:text-white">Pulse</span>
        </div>

        <nav className="mt-4 flex flex-col gap-1 px-3">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-300'
                    : 'text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-100 hover:bg-ink-50 dark:hover:bg-ink-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-primary-50 dark:bg-primary-500/10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <Icon className="relative z-10 shrink-0" size={16} />
                  <span className="relative z-10">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="rounded-xl bg-gradient-to-br from-primary-500/10 to-mint-500/10 p-4 border border-primary-500/10">
            <p className="text-xs font-medium text-ink-600 dark:text-ink-300">
              Track smarter, spend wiser.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
