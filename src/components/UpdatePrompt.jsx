import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 bg-ink border border-lime px-4 py-3 flex items-center gap-3 max-w-xl mx-auto">
      <p className="font-mono text-xs text-bone flex-1">
        Nova versão disponível
      </p>
      <button
        onClick={() => updateServiceWorker(true)}
        className="bg-lime text-ink font-mono font-bold text-xs uppercase tracking-widest px-3 py-2 active:bg-lime-dim"
      >
        Atualizar
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        className="font-mono text-xs text-mute px-1"
      >
        ✕
      </button>
    </div>
  )
}
