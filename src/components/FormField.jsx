export default function FormField({ label, error, children }) {
  return (
    <div className="mb-4">
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="mt-1 text-xs font-mono text-rust">{error}</p>}
    </div>
  )
}
