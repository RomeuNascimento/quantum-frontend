import Modal from './Modal'

// Substitui o window.confirm() nativo nas deleções — no design system e estilizável
export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirmar', message, confirmLabel = 'Remover', loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-on-surface-dim mb-5">{message}</p>
      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-danger text-white font-medium py-2.5 px-4 rounded-full active:opacity-80 disabled:opacity-40"
        >
          {loading ? 'Aguarde…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
