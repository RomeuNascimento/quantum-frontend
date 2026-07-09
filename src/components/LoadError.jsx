// Estado de erro de carregamento com ação de retry — antes o corpo ficava em branco
export default function LoadError({ onRetry }) {
  return (
    <div className="card border-outline py-10 px-4 text-center">
      <svg className="w-8 h-8 mx-auto mb-3 text-on-surface-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <p className="text-sm text-on-surface-dim mb-4">Não foi possível carregar</p>
      <button type="button" onClick={onRetry} className="btn-secondary w-auto inline-block px-6">
        Tentar novamente
      </button>
    </div>
  )
}
