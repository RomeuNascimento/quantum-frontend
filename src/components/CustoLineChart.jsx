const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const fmtDate = (iso) => { const [, m, d] = iso.split('-'); return `${parseInt(d)}/${MONTHS[parseInt(m) - 1]}` }
const brlShort = (v) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`

export default function CustoLineChart({ pontos }) {
  if (!pontos || pontos.length === 0) return null

  const W = 340, H = 170, PL = 14, PR = 14, PT = 38, PB = 26
  const cW = W - PL - PR
  const cH = H - PT - PB

  const custos = pontos.map((p) => p.custo)
  const minC = Math.min(...custos)
  const maxC = Math.max(...custos)
  const span = maxC - minC || maxC * 0.2 || 1

  const n = pontos.length
  const x = (i) => PL + (n === 1 ? cW / 2 : (i / (n - 1)) * cW)
  const y = (c) => PT + cH - ((c - (minC - span * 0.1)) / (span * 1.2)) * cH

  const linePts = pontos.map((p, i) => `${x(i).toFixed(1)},${y(p.custo).toFixed(1)}`)
  const pathD = 'M' + linePts.join(' L')
  const areaD = `${pathD} L${x(n - 1).toFixed(1)},${(PT + cH).toFixed(1)} L${x(0).toFixed(1)},${(PT + cH).toFixed(1)} Z`

  const xIdxs = n <= 3 ? pontos.map((_, i) => i) : [0, Math.round((n - 1) / 2), n - 1]
  const first = pontos[0]
  const last = pontos[n - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet"
      role="img" aria-label="Evolução do custo do produto ao longo do tempo">
      {/* Valores em destaque: início (esquerda) e atual (direita) */}
      <text x={PL} y={14} textAnchor="start" fontSize="10" fontFamily="'JetBrains Mono',monospace"
        fill="#5A584F" letterSpacing="0.5">INÍCIO</text>
      <text x={PL} y={30} textAnchor="start" fontSize="15" fontFamily="'JetBrains Mono',monospace"
        fill="#0B0B0F" fontWeight="600">{brlShort(first.custo)}</text>
      <text x={W - PR} y={14} textAnchor="end" fontSize="10" fontFamily="'JetBrains Mono',monospace"
        fill="#5A584F" letterSpacing="0.5">ATUAL</text>
      <text x={W - PR} y={30} textAnchor="end" fontSize="15" fontFamily="'JetBrains Mono',monospace"
        fill="#0B0B0F" fontWeight="600">{brlShort(last.custo)}</text>

      {/* Gridlines suaves */}
      {[0, 0.5, 1].map((t) => {
        const yy = PT + cH * (1 - t)
        return <line key={t} x1={PL} y1={yy} x2={W - PR} y2={yy} stroke="#D9D2BF"
          strokeWidth="0.75" strokeDasharray={t === 0 ? '' : '2 3'} />
      })}

      {/* Área + linha */}
      {n > 1 && <path d={areaD} fill="#D6FF3F" fillOpacity="0.2" stroke="none" />}
      {n > 1 && <path d={pathD} fill="none" stroke="#0B0B0F" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />}

      {/* Apenas os pontos de início e fim (sem poluir com todos) */}
      {[0, n - 1].map((i) => (
        <circle key={i} cx={x(i)} cy={y(pontos[i].custo)} r="5" fill="#D6FF3F" stroke="#0B0B0F" strokeWidth="2" />
      ))}

      {/* Datas no eixo X */}
      {xIdxs.map((i) => (
        <text key={i} x={x(i)} y={H - 6}
          textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
          fontSize="11" fontFamily="'JetBrains Mono',monospace" fill="#5A584F">
          {fmtDate(pontos[i].data)}
        </text>
      ))}
    </svg>
  )
}
