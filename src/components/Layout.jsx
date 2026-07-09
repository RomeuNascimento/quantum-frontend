import { useNavigate } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout({ title, children, onBack }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-10 bg-surface/85 backdrop-blur-md border-b border-outline print:hidden">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          {onBack && (
            <button onClick={typeof onBack === 'function' ? onBack : () => navigate(-1)} aria-label="Voltar" className="p-1 -ml-1">
              <svg className="w-5 h-5 text-on-surface" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-serif font-semibold text-primary flex-1">{title}</h1>
        </div>
      </header>
      <main className="pb-24 print:pb-0">
        <div className="max-w-xl mx-auto">{children}</div>
      </main>
      <BottomNav />
    </div>
  )
}
