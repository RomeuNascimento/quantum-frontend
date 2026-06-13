import { useId, Children, cloneElement, isValidElement } from 'react'

export default function FormField({ label, error, children }) {
  const autoId = useId()
  // Associa label↔campo: filho único sem id recebe um gerado (htmlFor aponta pra ele)
  const arr = Children.toArray(children)
  const unico = arr.length === 1 && isValidElement(arr[0]) ? arr[0] : null
  const id = unico?.props.id || autoId
  const filhos = unico && !unico.props.id ? cloneElement(unico, { id }) : children

  return (
    <div className="mb-4">
      {label && <label htmlFor={unico ? id : undefined} className="label">{label}</label>}
      {filhos}
      {error && <p className="mt-1 text-xs font-mono text-rust">{error}</p>}
    </div>
  )
}
