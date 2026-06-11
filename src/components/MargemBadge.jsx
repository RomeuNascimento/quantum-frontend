export default function MargemBadge({ margem }) {
  const valor = Number(margem)
  if (valor >= 30) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-widest bg-lime text-ink px-2 py-0.5 whitespace-nowrap">
        + Saudável {valor.toFixed(0)}%
      </span>
    )
  }
  if (valor >= 10) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-widest bg-bone border border-ink text-ink px-2 py-0.5 whitespace-nowrap">
        ± Atenção {valor.toFixed(0)}%
      </span>
    )
  }
  return (
    <span className="font-mono text-[10px] uppercase tracking-widest bg-rust text-bone px-2 py-0.5 whitespace-nowrap">
      − Revisar {valor.toFixed(0)}%
    </span>
  )
}
