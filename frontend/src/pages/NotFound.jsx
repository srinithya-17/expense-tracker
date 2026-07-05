import { Link } from 'react-router-dom';
import { FaCompass } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-50 dark:bg-ink-950 text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-500">
        <FaCompass size={26} />
      </div>
      <h1 className="text-3xl font-bold text-ink-900 dark:text-white">Page not found</h1>
      <p className="text-sm text-ink-400">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary mt-2">Back to dashboard</Link>
    </div>
  );
}
