const MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const fmtDate = (iso) => { const [,m,d] = iso.split('-'); return `${parseInt(d)}/${MONTHS[parseInt(m)-1]}` }
const brlShort = (v) => `R$${Number(v).toFixed(2).replace('.', ',')}`

export default function CustoLineChart({ pontos }) {
  if (!pontos || pontos.length === 0) return null

  const W = 320, H = 96, PL = 54, PR = 12, PT = 10, PB = 22
  const cW = W - PL - PR
  const cH = H - PT - PB

  const custos = pontos.map(p => p.custo)
  const minC = Math.min(...custos)
  const maxC = Math.max(...custos)
  const span = maxC - minC || maxC * 0.2 || 1

  const n = pontos.length
  const x = (i) => PL + (n === 1 ? cW / 2 : (i / (n - 1)) * cW)
  const y = (c) => PT + cH - ((c - (minC - span * 0.1)) / (span * 1.2)) * cH

  const pathD = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.custo).toFixed(1)}`).join(' ')

  // X labels: max 4, sempre primeiro e último
  const xIdxs = n <= 4
    ? pontos.map((_, i) => i)
    : [0, Math.round(n / 3), Math.round((2 * n) / 3), n - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 96 }}>
      {/* Gridlines horizontais */}
      {[0, 0.5, 1].map((t) => {
        const yy = PT + cH * (1 - t)
        return <line key={t} x1={PL} y1={yy} x2={W - PR} y2={yy} stroke="#D9D2BF" strokeWidth="0.5" />
      })}
      {/* Eixo Y */}
      <line x1={PL} y1={PT} x2={PL} y2={PT + cH} stroke="#D9D2BF" strokeWidth="1" />
      {/* Label Y: máx e mín */}
      <text x={PL - 3} y={PT + 4} textAnchor="end" fontSize="7.5" fontFamily="'JetBrains Mono',monospace" fill="#6B6A60">{brlShort(maxC)}</text>
      <text x={PL - 3} y={PT + cH} textAnchor="end" fontSize="7.5" fontFamily="'JetBrains Mono',monospace" fill="#6B6A60">{brlShort(minC)}</text>
      {/* Linha */}
      {n > 1 && <path d={pathD} fill="none" stroke="#D6FF3F" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />}
      {/* Dots + tooltip label no último ponto */}
      {pontos.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.custo)} r="3.5" fill="#D6FF3F" stroke="#0B0B0F" strokeWidth="1.5" />
          {i === n - 1 && (
            <text x={x(i)} y={y(p.custo) - 7} textAnchor="middle" fontSize="7.5"
              fontFamily="'JetBrains Mono',monospace" fill="#0B0B0F" fontWeight="600">
              {brlShort(p.custo)}
            </text>
          )}
        </g>
      ))}
      {/* X labels */}
      {xIdxs.map((i) => (
        <text key={i} x={x(i)} y={H - 4} textAnchor="middle" fontSize="7.5"
          fontFamily="'JetBrains Mono',monospace" fill="#6B6A60">
          {fmtDate(pontos[i].data)}
        </text>
      ))}
    </svg>
  )
}
