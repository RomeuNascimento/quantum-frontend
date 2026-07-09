export default function MargemBadge({ margem }) {
  const valor = Number(margem)
  if (valor >= 30) {
    return (
      <span className="badge bg-positive-bg text-positive whitespace-nowrap">
        + Saudável {valor.toFixed(0)}%
      </span>
    )
  }
  if (valor >= 10) {
    return (
      <span className="badge bg-warm text-on-warm whitespace-nowrap">
        ± Atenção {valor.toFixed(0)}%
      </span>
    )
  }
  return (
    <span className="badge bg-danger-bg text-on-danger-bg whitespace-nowrap">
      − Revisar {valor.toFixed(0)}%
    </span>
  )
}
