// Estado de erro de carregamento com ação de retry — antes o corpo ficava em branco
export default function LoadError({ onRetry }) {
  return (
    <div className="border border-line py-10 px-4 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-mute mb-4">Não foi possível carregar</p>
      <button type="button" onClick={onRetry} className="btn-ghost w-auto inline-block px-6 py-2 text-xs">
        Tentar novamente
      </button>
    </div>
  )
}
