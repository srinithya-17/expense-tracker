import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Are you sure?', message, danger = true, loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-ink-500 dark:text-ink-400">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={loading}>
          {loading ? 'Please wait...' : 'Confirm'}
        </button>
      </div>
    </Modal>
  );
}
