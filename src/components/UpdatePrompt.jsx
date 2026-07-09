import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 bg-primary rounded-xl border border-outline-strong px-4 py-3 flex items-center gap-3 max-w-xl mx-auto shadow-lg">
      <p className="font-sans text-sm text-on-primary flex-1">
        Nova versão disponível
      </p>
      <button
        onClick={() => updateServiceWorker(true)}
        className="bg-card text-primary font-medium text-sm px-3 py-1.5 rounded-full active:opacity-80"
      >
        Atualizar
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        className="font-sans text-sm text-on-primary/60 px-1"
        aria-label="Dispensar"
      >
        ✕
      </button>
    </div>
  )
}
