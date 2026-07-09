export default function LoadingSpinner({ text = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-8 h-8 border-2 border-outline border-t-primary rounded-full animate-spin" />
      <p className="font-mono text-xs uppercase tracking-widest text-on-surface-dim">{text}</p>
    </div>
  )
}
