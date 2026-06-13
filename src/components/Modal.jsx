import { useEffect, useRef, useId } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Modal({ isOpen, onClose, title, children }) {
  const panelRef = useRef(null)
  const tituloId = useId()

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'

    // Move o foco para o painel (leitor de tela anuncia o dialog) e devolve ao gatilho ao fechar
    const origem = document.activeElement
    panelRef.current?.focus()

    return () => {
      document.body.style.overflow = ''
      if (origem instanceof HTMLElement) origem.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    // Focus trap: Tab/Shift+Tab circulam dentro do modal
    const focaveis = panelRef.current?.querySelectorAll(FOCUSABLE)
    if (!focaveis?.length) return
    const primeiro = focaveis[0]
    const ultimo = focaveis[focaveis.length - 1]
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault()
      ultimo.focus()
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault()
      primeiro.focus()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-ink/60" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        tabIndex={-1}
        className="relative bg-bone w-full sm:max-w-md rounded-none max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h2 id={tituloId} className="text-base font-sans font-semibold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="p-1 text-mute active:text-ink">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
