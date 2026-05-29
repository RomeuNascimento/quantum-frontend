import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal'
import FormField from '../../components/FormField'
import { listarProdutos, historicoCustoProduto } from '../../api/produtos'
import { listarCanais, criarCanal } from '../../api/precificacao'
import { listarPrecosProduto, criarPrecoProduto, atualizarPrecoProduto } from '../../api/precificacao'
import { useForm } from 'react-hook-form'

const MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const fmtDate = (iso) => { const [,m,d] = iso.split('-'); return `${parseInt(d)}/${MONTHS[parseInt(m)-1]}` }
const brlShort = (v) => `R$${Number(v).toFixed(2)}`

function CustoLineChart({ pontos }) {
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

const brl = (v) => `R$ ${Number(v || 0).toFixed(2)}`
const pctStr = (v) => `${Math.max(0, v).toFixed(0)}%`

function PrecoDecomposicao({ pp }) {
  const preco = pp.preco_sugerido
  if (!preco || preco <= 0) return null
  const custoR = pp.custo_total
  const margemR = preco * pp.margem_pct / 100
  const taxasR = Math.max(0, preco - custoR - margemR)
  const pct = (v) => `${Math.max(0, (v / preco) * 100).toFixed(1)}%`
  return (
    <div className="mt-3 pt-3 border-t border-line">
      <div className="flex h-2.5 w-full overflow-hidden border border-ink/15">
        <div style={{ width: pct(custoR) }} className="bg-ink flex-shrink-0" />
        <div style={{ width: pct(margemR) }} className="bg-lime flex-shrink-0" />
        <div style={{ width: pct(taxasR) }} className="bg-line flex-shrink-0" />
      </div>
      <div className="flex gap-3 mt-1.5 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-ink inline-block flex-shrink-0" />
          <span className="font-mono text-[9px] text-mute uppercase tracking-widest">Custo {pctStr((custoR/preco)*100)}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-lime inline-block flex-shrink-0" />
          <span className="font-mono text-[9px] text-mute uppercase tracking-widest">Margem {pctStr(pp.margem_pct)}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-line border border-ink/20 inline-block flex-shrink-0" />
          <span className="font-mono text-[9px] text-mute uppercase tracking-widest">Taxas {pctStr((taxasR/preco)*100)}</span>
        </span>
      </div>
    </div>
  )
}

function MargemBadge({ margem }) {
  if (margem >= 30) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-widest bg-lime text-ink px-2 py-0.5">
        + Saudável {margem}%
      </span>
    )
  }
  if (margem >= 10) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-widest bg-bone border border-ink text-ink px-2 py-0.5">
        ± Atenção {margem}%
      </span>
    )
  }
  return (
    <span className="font-mono text-[10px] uppercase tracking-widest bg-rust text-bone px-2 py-0.5">
      − Revisar {margem}%
    </span>
  )
}

export default function Precificacao() {
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState([])
  const [canais, setCanais] = useState([])
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [precos, setPrecos] = useState([])
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModalCanal, setShowModalCanal] = useState(false)
  const [showModalPreco, setShowModalPreco] = useState(false)
  const [editPreco, setEditPreco] = useState(null)

  const { register: regCanal, handleSubmit: submitCanal, reset: resetCanal } = useForm()
  const { register: regPreco, handleSubmit: submitPreco, reset: resetPreco, setValue } = useForm()

  const carregar = async () => {
    const [p, c] = await Promise.all([listarProdutos(), listarCanais()])
    setProdutos(p.data)
    setCanais(c.data)
    if (p.data.length > 0 && !produtoSelecionado) {
      selecionarProduto(p.data[0].id)
    }
    setLoading(false)
  }

  const selecionarProduto = async (id) => {
    setProdutoSelecionado(id)
    const [r, h] = await Promise.all([listarPrecosProduto(id), historicoCustoProduto(id)])
    setPrecos(r.data)
    setHistorico(h.data.pontos || [])
  }

  useEffect(() => { carregar() }, [])

  const onCriarCanal = async (dados) => {
    await criarCanal({
      ...dados,
      taxa_plataforma_pct: parseFloat(dados.taxa_plataforma_pct) || 0,
      taxa_cartao_pct: parseFloat(dados.taxa_cartao_pct) || 0,
      imposto_pct: parseFloat(dados.imposto_pct) || 0,
    })
    resetCanal()
    setShowModalCanal(false)
    carregar()
  }

  const onSalvarPreco = async (dados) => {
    const payload = {
      canal_id: parseInt(dados.canal_id),
      margem_pct: parseFloat(dados.margem_pct),
      preco_final: dados.preco_final ? parseFloat(dados.preco_final) : null,
    }
    if (editPreco) {
      await atualizarPrecoProduto(produtoSelecionado, editPreco.id, payload)
    } else {
      await criarPrecoProduto(produtoSelecionado, payload)
    }
    setShowModalPreco(false)
    setEditPreco(null)
    resetPreco()
    selecionarProduto(produtoSelecionado)
  }

  const abrirEditar = (pp) => {
    setEditPreco(pp)
    setValue('canal_id', pp.canal_id)
    setValue('margem_pct', pp.margem_pct)
    setValue('preco_final', pp.preco_final || '')
    setShowModalPreco(true)
  }

  return (
    <Layout title="Precificação" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4">
        {loading ? <LoadingSpinner /> : (
          <>
            {/* Canais */}
            <div className="flex items-center justify-between mb-3">
              <p className="label">Canais de venda</p>
              <button
                onClick={() => setShowModalCanal(true)}
                className="font-mono text-xs uppercase tracking-widest text-ink border border-ink px-3 py-1"
              >
                + Canal
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
              {canais.map((c) => (
                <div key={c.id} className="flex-shrink-0 card px-3 py-2 min-w-[140px]">
                  <p className="font-sans font-semibold text-ink text-sm">{c.nome}</p>
                  <p className="font-mono text-xs text-mute">Plataforma: {c.taxa_plataforma_pct}%</p>
                  <p className="font-mono text-xs text-mute">Cartão: {c.taxa_cartao_pct}%</p>
                  <p className="font-mono text-xs text-mute">Imposto: {c.imposto_pct}%</p>
                </div>
              ))}
            </div>

            {/* Seletor de produto */}
            <FormField label="Produto">
              <select className="input" value={produtoSelecionado || ''} onChange={(e) => selecionarProduto(e.target.value)}>
                {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </FormField>

            {/* Gráfico evolução de custo */}
            {historico.length > 0 && (
              <div className="card mb-5 mt-4 px-3 pt-3 pb-2">
                <p className="label mb-2">Evolução do custo</p>
                <CustoLineChart pontos={historico} />
                {historico.length === 1 && (
                  <p className="font-mono text-[10px] text-mute mt-1 text-center uppercase tracking-widest">
                    Adicione mais preços aos ingredientes para ver a evolução
                  </p>
                )}
              </div>
            )}

            {/* Preços do produto */}
            <div className="flex items-center justify-between mb-3 mt-4">
              <p className="label">Preços por canal</p>
              <button
                onClick={() => { setEditPreco(null); resetPreco(); setShowModalPreco(true) }}
                className="font-mono text-xs uppercase tracking-widest text-ink border border-ink px-3 py-1"
              >
                + Precificar
              </button>
            </div>

            <div>
              {precos.length === 0 && (
                <p className="font-mono text-xs text-mute text-center py-4 uppercase tracking-widest">
                  Nenhum canal precificado ainda
                </p>
              )}
              {precos.map((pp) => (
                <button key={pp.id} onClick={() => abrirEditar(pp)}
                  className="card w-full text-left mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans font-semibold text-ink text-sm">{pp.canal_nome}</span>
                    <MargemBadge margem={pp.margem_pct} />
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="label">Custo total</p>
                      <p className="qtm-num text-sm text-ink">{brl(pp.custo_total)}</p>
                    </div>
                    <div className="text-center">
                      <p className="label">Sugerido</p>
                      <p className="qtm-num text-sm font-bold text-ink bg-lime px-2">{brl(pp.preco_sugerido)}</p>
                    </div>
                    <div className="text-right">
                      <p className="label">Manual</p>
                      <p className="qtm-num text-sm text-mute">{pp.preco_final ? brl(pp.preco_final) : '—'}</p>
                    </div>
                  </div>
                  <PrecoDecomposicao pp={pp} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal canal */}
      <Modal isOpen={showModalCanal} onClose={() => setShowModalCanal(false)} title="Novo canal">
        <form onSubmit={submitCanal(onCriarCanal)} className="space-y-3">
          <FormField label="Nome"><input className="input" {...regCanal('nome', { required: true })} /></FormField>
          <FormField label="Taxa plataforma (%)"><input className="input" type="number" step="0.01" {...regCanal('taxa_plataforma_pct')} /></FormField>
          <FormField label="Taxa cartão (%)"><input className="input" type="number" step="0.01" {...regCanal('taxa_cartao_pct')} /></FormField>
          <FormField label="Imposto (%)"><input className="input" type="number" step="0.01" {...regCanal('imposto_pct')} /></FormField>
          <button type="submit" className="btn-primary">Criar canal</button>
        </form>
      </Modal>

      {/* Modal preço */}
      <Modal isOpen={showModalPreco} onClose={() => { setShowModalPreco(false); setEditPreco(null) }}
        title={editPreco ? 'Editar precificação' : 'Precificar produto'}>
        <form onSubmit={submitPreco(onSalvarPreco)} className="space-y-3">
          {!editPreco && (
            <FormField label="Canal">
              <select className="input" {...regPreco('canal_id', { required: true })}>
                <option value="">Selecione</option>
                {canais.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </FormField>
          )}
          <FormField label="Margem desejada (%)">
            <input className="input" type="number" step="0.1" {...regPreco('margem_pct', { required: true })} />
          </FormField>
          <FormField label="Preço final manual (opcional)">
            <input className="input" type="number" step="0.01" placeholder="Deixe em branco para usar o sugerido"
              {...regPreco('preco_final')} />
          </FormField>
          <button type="submit" className="btn-primary">Salvar</button>
        </form>
      </Modal>
    </Layout>
  )
}
