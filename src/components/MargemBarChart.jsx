import { Link } from 'react-router-dom'

// Barras horizontais de margem real por produto (pior canal de cada um).
// ≥30% sálvia (saudável), 10–29% dourado (atenção), <10% vermelho (revisar).
const cor = (m) => (m >= 30 ? 'bg-positive' : m >= 10 ? 'bg-accent-soft' : 'bg-danger')

export default function MargemBarChart({ produtos }) {
  const linhas = produtos
    .filter((p) => p.canais.length > 0)
    .map((p) => ({
      id: p.produto_id,
      nome: p.produto_nome,
      margem: Math.min(...p.canais.map((c) => c.margem_real_pct)),
    }))
    .sort((a, b) => a.margem - b.margem)
    .slice(0, 5)

  if (linhas.length === 0) return null

  const max = Math.max(40, ...linhas.map((l) => l.margem))

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="label mb-0">Margem por produto</p>
        <Link to="/relatorio" className="font-mono text-[10px] uppercase tracking-widest text-accent">
          Ver tudo →
        </Link>
      </div>
      <div className="space-y-2.5">
        {linhas.map((l) => (
          <Link key={l.id} to={`/produtos/${l.id}`} className="block">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-on-surface truncate flex-1">{l.nome}</span>
              <span className="qtm-num text-sm font-semibold text-on-surface ml-2">{l.margem.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${cor(l.margem)}`}
                style={{ width: `${Math.max(2, (Math.max(l.margem, 0) / max) * 100)}%` }}
              />
            </div>
          </Link>
        ))}
      </div>
      <p className="font-mono text-[9px] uppercase tracking-widest text-on-surface-dim mt-3">
        Pior canal de cada produto
      </p>
    </div>
  )
}
