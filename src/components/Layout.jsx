import { useNavigate } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout({ title, children, onBack }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack || (() => navigate(-1))} className="p-1 -ml-1">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900 flex-1">{title}</h1>
      </header>
      <main className="pb-24">{children}</main>
      <BottomNav />
    </div>
  )
}
