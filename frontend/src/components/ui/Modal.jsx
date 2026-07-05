import { AnimatePresence, motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-ink-850 shadow-2xl`}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-ink-100 dark:border-ink-700 bg-white/90 dark:bg-ink-850/90 backdrop-blur px-6 py-4">
              <h3 className="text-lg font-semibold text-ink-900 dark:text-white">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-100 dark:hover:bg-ink-700 hover:text-ink-700"
                aria-label="Close"
              >
                <FaTimes size={14} />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
