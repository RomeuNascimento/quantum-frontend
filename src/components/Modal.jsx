import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/60" onClick={onClose} />
      <div className="relative bg-bone w-full sm:max-w-md rounded-none max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h2 className="text-base font-sans font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="p-1 text-mute active:text-ink">
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
