export default function LoadingSpinner({ text = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-8 h-8 border-2 border-lime/30 border-t-lime rounded-full animate-spin" />
      <p className="font-mono text-xs uppercase tracking-widest text-mute">{text}</p>
    </div>
  )
}
