import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const TITLES = {
  '/': 'Dashboard',
  '/income': 'Income',
  '/expenses': 'Expenses',
  '/categories': 'Categories',
  '/budgets': 'Budgets',
  '/transactions': 'Transactions',
  '/analysis': 'Analysis',
  '/profile': 'Profile',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = TITLES[location.pathname] || 'Pulse';

  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark bg-ink-50 dark:bg-ink-950">
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
          <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
