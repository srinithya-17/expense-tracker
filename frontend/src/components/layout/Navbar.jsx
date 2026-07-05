import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaMoon, FaSun, FaSignOutAlt, FaUserCircle, FaCog } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/format';
import toast from 'react-hot-toast';

export default function Navbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-ink-100 dark:border-ink-800 bg-white/70 dark:bg-ink-900/70 backdrop-blur-xl px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 lg:hidden"
        >
          <FaBars size={16} />
        </button>
        <h1 className="text-lg font-semibold text-ink-900 dark:text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 dark:text-ink-300 transition hover:bg-ink-100 dark:hover:bg-ink-800"
        >
          {theme === 'dark' ? <FaSun size={15} /> : <FaMoon size={15} />}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-ink-100 dark:border-ink-700 py-1 pl-1 pr-3 transition hover:bg-ink-50 dark:hover:bg-ink-800"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-lg object-cover" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-mint-500 text-xs font-semibold text-white">
                {getInitials(user?.name)}
              </div>
            )}
            <span className="hidden text-sm font-medium text-ink-700 dark:text-ink-200 sm:block">
              {user?.name?.split(' ')[0]}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-850 py-1.5 shadow-glass dark:shadow-glass-dark animate-fade-in">
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800"
              >
                <FaUserCircle size={14} /> Profile
              </Link>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800"
              >
                <FaCog size={14} /> Settings
              </Link>
              <div className="my-1 border-t border-ink-100 dark:border-ink-700" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-coral-500 hover:bg-coral-50 dark:hover:bg-coral-500/10"
              >
                <FaSignOutAlt size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
