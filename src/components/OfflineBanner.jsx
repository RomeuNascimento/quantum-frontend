import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const [status, setStatus] = useState(() => navigator.onLine ? 'online' : 'offline')

  useEffect(() => {
    let timer
    const handleOnline = () => {
      setStatus('reconnected')
      timer = setTimeout(() => setStatus('online'), 2500)
    }
    const handleOffline = () => {
      clearTimeout(timer)
      setStatus('offline')
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearTimeout(timer)
    }
  }, [])

  if (status === 'online') return null

  if (status === 'reconnected') {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-lime text-ink font-mono text-[10px] uppercase tracking-widest text-center py-1.5">
        Conexão restaurada
      </div>
    )
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-ink text-bone/70 font-mono text-[10px] uppercase tracking-widest text-center py-1.5 border-b border-plasma">
      Sem conexão — modo leitura
    </div>
  )
}
