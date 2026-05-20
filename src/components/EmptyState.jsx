export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 border border-line flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-mute" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
          <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="font-mono text-xs uppercase tracking-widest text-mute mb-1">{title}</h3>
      <p className="text-sm text-mute mb-6">{description}</p>
      {action}
    </div>
  )
}
