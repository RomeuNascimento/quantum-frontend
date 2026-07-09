import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import LoadError from '../../components/LoadError'
import EmptyState from '../../components/EmptyState'
import { relatorioPrecosInsumos } from '../../api/ingredientes'
import { brl4 } from '../../utils/format'

// Rótulo do custo unitário conforme a unidade de compra (custo é por g/ml/un base)
const rotuloUnidade = (u) => (u === 'unid' ? '/un' : u === 'ml' || u === 'L' ? '/ml' : '/g')

const fmtData = (iso) => {
  if (!iso) return '—'
  const [ano, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano.slice(2)}`
}

// Badge de variação: subir preço é ruim (vermelho), cair é bom (verde)
function VariacaoBadge({ pct }) {
  if (pct == null) return null
  const sobe = pct > 0.5
  const cai = pct < -0.5
  const cls = sobe ? 'bg-danger-bg text-on-danger-bg' : cai ? 'bg-positive-bg text-positive' : 'bg-surface-2 text-on-surface-dim'
  const seta = sobe ? '↑' : cai ? '↓' : '→'
  return <span className={`badge ${cls}`}>{seta} {Math.abs(pct).toFixed(0)}%</span>
}

export default function RelatorioInsumos() {
  const navigate = useNavigate()
  const [aberto, setAberto] = useState(null)

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['relatorio-precos-insumos'],
    queryFn: () => relatorioPrecosInsumos().then((r) => r.data),
  })

  return (
    <Layout title="Preços dos insumos" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4">
        <header className="mb-5">
          <p className="eyebrow">RELATÓRIO</p>
          <h1 className="title-serif text-3xl">Preços dos insumos</h1>
          <p className="text-sm text-on-surface-dim mt-1">
            Como o preço de cada ingrediente mudou ao longo das compras.
          </p>
        </header>

        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <LoadError onRetry={refetch} />
        ) : data.length === 0 ? (
          <EmptyState
            title="Sem histórico ainda"
            description="Assim que você registrar preços dos ingredientes (na mão ou pela nota fiscal), o histórico aparece aqui."
          />
        ) : (
          <div className="space-y-3">
            {data.map((ing) => {
              const rot = rotuloUnidade(ing.unidade)
              const expandido = aberto === ing.id
              return (
                <div key={ing.id} className="card p-0 overflow-hidden">
                  <button
                    onClick={() => setAberto(expandido ? null : ing.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-surface-1">
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-semibold text-base text-on-surface truncate">
                        {ing.nome}{ing.marca ? <span className="text-on-surface-dim font-sans font-normal"> · {ing.marca}</span> : null}
                      </p>
                      <p className="text-xs text-on-surface-dim mt-0.5">
                        <span className="qtm-num">{ing.n_registros}</span> {ing.n_registros === 1 ? 'compra' : 'compras'} registrada{ing.n_registros === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="qtm-num text-sm text-on-surface">{brl4(ing.custo_atual)}<span className="text-on-surface-dim">{rot}</span></p>
                      <div className="mt-0.5"><VariacaoBadge pct={ing.variacao_pct} /></div>
                    </div>
                    <svg className={`w-4 h-4 text-on-surface-dim flex-shrink-0 transition-transform ${expandido ? 'rotate-90' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {expandido && (
                    <div className="border-t border-outline bg-surface-1 px-4 py-2">
                      {ing.pontos.map((p, i) => {
                        const anterior = ing.pontos[i + 1]
                        const delta = anterior && anterior.custo_unitario
                          ? (p.custo_unitario - anterior.custo_unitario) / anterior.custo_unitario * 100
                          : null
                        return (
                          <div key={i} className="flex items-center gap-2 py-1.5 border-b border-outline/60 last:border-b-0">
                            <span className="qtm-num text-xs text-on-surface-dim w-14">{fmtData(p.data)}</span>
                            <span className="font-sans text-xs text-on-surface-dim flex-1">
                              {p.preco != null && <>R$ <span className="qtm-num">{Number(p.preco).toFixed(2).replace('.', ',')}</span> / <span className="qtm-num">{p.quantidade_embalagem}</span></>}
                            </span>
                            <span className="qtm-num text-xs text-on-surface">{brl4(p.custo_unitario)}{rot}</span>
                            <span className="w-12 text-right"><VariacaoBadge pct={delta} /></span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
