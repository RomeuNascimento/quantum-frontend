import Modal from './Modal'

// Substitui o window.confirm() nativo nas deleções — no design system e estilizável
export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirmar', message, confirmLabel = 'Remover', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-ink mb-4">{message}</p>
      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="btn-ghost flex-1 py-2 text-xs">
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-rust text-bone font-mono font-bold py-2 px-4 rounded-none uppercase tracking-widest text-xs active:opacity-80 disabled:opacity-40"
        >
          {loading ? 'Aguarde…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
