import { motion } from 'framer-motion';

const TONES = {
  primary: { chip: 'text-primary-500 bg-primary-50 dark:bg-primary-500/10' },
  mint: { chip: 'text-mint-500 bg-mint-50 dark:bg-mint-500/10' },
  coral: { chip: 'text-coral-500 bg-coral-50 dark:bg-coral-500/10' },
  gold: { chip: 'text-gold-500 bg-gold-50 dark:bg-gold-500/10' },
};

export default function StatCard({ label, value, icon: Icon, tone = 'primary', trend, delay = 0 }) {
  const { chip } = TONES[tone] || TONES.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
          <p className="stat-number mt-2 text-2xl text-ink-900 dark:text-white">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${chip}`}>
          <Icon size={16} />
        </div>
      </div>
      {trend && <p className="mt-3 text-xs text-ink-400">{trend}</p>}
    </motion.div>
  );
}
