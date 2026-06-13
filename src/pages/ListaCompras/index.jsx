import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueries } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import LoadError from '../../components/LoadError'
import EmptyState from '../../components/EmptyState'
import CompartilharWhatsApp from '../../components/CompartilharWhatsApp'
import { listarReceitas, detalharReceita } from '../../api/receitas'

const fmtQtd = (n) => {
  const v = Math.round(n * 100) / 100
  if (v === 0) return '0'
  if (v % 1 === 0) return v.toString()
  return v.toFixed(2).replace('.', ',')
}

// Converte g→kg e ml→L quando fica grande, pra lista de compras ficar legível
const fmtMedida = (qtd, unidade) => {
  if ((unidade === 'g' || unidade === 'ml') && qtd >= 1000) {
    return `${fmtQtd(qtd / 1000)} ${unidade === 'g' ? 'kg' : 'L'}`
  }
  return `${fmtQtd(qtd)} ${unidade}`
}

let _seq = 0

export default function ListaCompras() {
  const navigate = useNavigate()
  const [linhas, setLinhas] = useState([])   // { key, receitaId, mult }
  const [sel, setSel] = useState('')
  const [mult, setMult] = useState('1')
  const [comprados, setComprados] = useState({})  // { 'nome||unidade': true }

  const receitasQ = useQuery({
    queryKey: ['receitas'],
    queryFn: () => listarReceitas().then((r) => r.data),
  })
  const receitas = receitasQ.data ?? []

  const idsDistintos = [...new Set(linhas.map((l) => l.receitaId))]
  const detalhesQ = useQueries({
    queries: idsDistintos.map((id) => ({
      queryKey: ['receita', id],
      queryFn: () => detalharReceita(id).then((r) => r.data),
    })),
  })
  const detalhePorId = {}
  idsDistintos.forEach((id, i) => { if (detalhesQ[i]?.data) detalhePorId[id] = detalhesQ[i].data })
  const carregandoDetalhes = detalhesQ.some((q) => q.isLoading)

  // Agrega ingredientes de todas as linhas (cálculo barato — sem useMemo)
  const mapa = new Map()
  for (const l of linhas) {
    const d = detalhePorId[l.receitaId]
    if (!d) continue
    for (const ing of d.ingredientes) {
      const key = `${ing.ingrediente_nome}||${ing.unidade}`
      const prev = mapa.get(key) || { key, nome: ing.ingrediente_nome, unidade: ing.unidade, qtd: 0 }
      prev.qtd += ing.quantidade_g * l.mult
      mapa.set(key, prev)
    }
  }
  const ingredientes = [...mapa.values()].sort((a, b) => a.nome.localeCompare(b.nome))

  const adicionar = () => {
    const id = Number(sel)
    const m = parseFloat(String(mult).replace(',', '.')) || 1
    if (!id || m <= 0) return
    setLinhas((ls) => [...ls, { key: ++_seq, receitaId: id, mult: m }])
    setSel('')
    setMult('1')
  }

  const remover = (key) => setLinhas((ls) => ls.filter((l) => l.key !== key))
  const nomeReceita = (id) => receitas.find((r) => r.id === id)?.nome ?? '?'

  const texto = [
    '🛒 *Lista de compras*',
    '',
    ...ingredientes.map((i) => `• ${i.nome}: ${fmtMedida(i.qtd, i.unidade)}`),
  ].join('\n')

  if (receitasQ.isLoading) {
    return <Layout title="Lista de compras" onBack={() => navigate('/dashboard')}><div className="px-4 pt-10"><LoadingSpinner /></div></Layout>
  }
  if (receitasQ.isError) {
    return <Layout title="Lista de compras" onBack={() => navigate('/dashboard')}><div className="px-4 pt-4"><LoadError onRetry={() => receitasQ.refetch()} /></div></Layout>
  }

  return (
    <Layout title="Lista de compras" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4 pb-8 space-y-5">
        {receitas.length === 0 ? (
          <EmptyState
            title="Nenhuma receita"
            description="Cadastre receitas para montar sua lista de compras"
            action={<Link to="/receitas/novo" className="btn-primary inline-block px-4 py-2 text-xs">+ Receita</Link>}
          />
        ) : (
          <>
            {/* Adicionar receita */}
            <div className="card space-y-3">
              <div>
                <p className="label">Receita</p>
                <select className="input" value={sel} onChange={(e) => setSel(e.target.value)}>
                  <option value="">Selecionar receita...</option>
                  {receitas.map((r) => (
                    <option key={r.id} value={r.id}>{r.nome}{r.tipo ? ` (${r.tipo})` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <p className="label">Quantas vezes a receita</p>
                  <input className="input" type="number" inputMode="decimal" min="0" step="any"
                    value={mult} onChange={(e) => setMult(e.target.value)} />
                </div>
                <button onClick={adicionar} disabled={!sel}
                  className="btn-secondary w-auto px-5 disabled:opacity-40">+ Add</button>
              </div>
            </div>

            {/* Linhas adicionadas */}
            {linhas.length > 0 && (
              <div>
                <p className="label mb-2">Vou produzir</p>
                <div className="border border-line">
                  {linhas.map((l) => (
                    <div key={l.key} className="flex items-center justify-between px-3 py-2 border-b border-line last:border-b-0">
                      <span className="text-sm text-ink flex-1 min-w-0 truncate pr-2">
                        {nomeReceita(l.receitaId)} <span className="qtm-num text-mute">× {fmtQtd(l.mult)}</span>
                      </span>
                      <button onClick={() => remover(l.key)} aria-label="Remover"
                        className="font-mono text-xs text-rust flex-shrink-0 px-2">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista agregada */}
            {linhas.length === 0 ? (
              <p className="font-mono text-xs text-mute text-center py-6 uppercase tracking-widest">
                Adicione receitas para montar a lista
              </p>
            ) : carregandoDetalhes && ingredientes.length === 0 ? (
              <LoadingSpinner />
            ) : (
              <>
                <div>
                  <p className="label mb-2">Você vai precisar de</p>
                  <div className="border border-line">
                    {ingredientes.map((i) => {
                      const feito = !!comprados[i.key]
                      return (
                        <button key={i.key} type="button"
                          onClick={() => setComprados((c) => ({ ...c, [i.key]: !c[i.key] }))}
                          className="w-full flex items-center gap-3 px-3 py-2.5 border-b border-line last:border-b-0 text-left active:bg-line/30">
                          <span className={`w-4 h-4 border border-ink flex-shrink-0 flex items-center justify-center ${feito ? 'bg-lime' : 'bg-white'}`}>
                            {feito && <span className="text-ink text-[10px] leading-none">✓</span>}
                          </span>
                          <span className={`text-sm flex-1 min-w-0 truncate pr-2 ${feito ? 'line-through text-mute' : 'text-ink font-medium'}`}>
                            {i.nome}
                          </span>
                          <span className={`qtm-num text-sm flex-shrink-0 ${feito ? 'text-mute line-through' : 'text-ink'}`}>
                            {fmtMedida(i.qtd, i.unidade)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <p className="font-mono text-[10px] text-mute mt-1 uppercase tracking-widest">
                    Toque pra marcar o que já comprou
                  </p>
                </div>

                <CompartilharWhatsApp texto={texto} label="Enviar lista por WhatsApp" />
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
