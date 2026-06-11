import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal'
import FormField from '../../components/FormField'
import CustoLineChart from '../../components/CustoLineChart'
import MargemBadge from '../../components/MargemBadge'
import { listarProdutos, historicoCustoProduto } from '../../api/produtos'
import { listarCanais, criarCanal } from '../../api/precificacao'
import { listarPrecosProduto, criarPrecoProduto, atualizarPrecoProduto } from '../../api/precificacao'
import { useForm } from 'react-hook-form'

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
  const [erro, setErro] = useState('')
  // Guarda contra race: ao trocar de produto rápido, só a resposta da
  // seleção mais recente pode escrever no estado
  const selecaoAtual = useRef(null)

  const { register: regCanal, handleSubmit: submitCanal, reset: resetCanal } = useForm()
  const { register: regPreco, handleSubmit: submitPreco, reset: resetPreco, setValue } = useForm()

  const carregar = async () => {
    try {
      const [p, c] = await Promise.all([listarProdutos(), listarCanais()])
      setProdutos(p.data)
      setCanais(c.data)
      if (p.data.length > 0 && !produtoSelecionado) {
        selecionarProduto(p.data[0].id)
      }
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  const selecionarProduto = async (id) => {
    setProdutoSelecionado(id)
    selecaoAtual.current = id
    try {
      const [r, h] = await Promise.all([listarPrecosProduto(id), historicoCustoProduto(id)])
      if (selecaoAtual.current !== id) return
      setPrecos(r.data)
      setHistorico(h.data.pontos || [])
    } catch (e) {
      if (selecaoAtual.current === id) setErro(e.message)
    }
  }

  useEffect(() => { carregar() }, [])

  const onCriarCanal = async (dados) => {
    try {
      await criarCanal({
        ...dados,
        taxa_plataforma_pct: parseFloat(dados.taxa_plataforma_pct) || 0,
        taxa_cartao_pct: parseFloat(dados.taxa_cartao_pct) || 0,
        imposto_pct: parseFloat(dados.imposto_pct) || 0,
      })
      resetCanal()
      setShowModalCanal(false)
      carregar()
    } catch (e) {
      setErro(e.message)
      setShowModalCanal(false)
    }
  }

  const onSalvarPreco = async (dados) => {
    const payload = {
      canal_id: parseInt(dados.canal_id),
      margem_pct: parseFloat(dados.margem_pct),
      preco_final: dados.preco_final ? parseFloat(dados.preco_final) : null,
    }
    try {
      if (editPreco) {
        await atualizarPrecoProduto(produtoSelecionado, editPreco.id, payload)
      } else {
        await criarPrecoProduto(produtoSelecionado, payload)
      }
      setShowModalPreco(false)
      setEditPreco(null)
      resetPreco()
      selecionarProduto(produtoSelecionado)
    } catch (e) {
      setErro(e.message)
      setShowModalPreco(false)
      setEditPreco(null)
    }
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
        {erro && (
          <div className="bg-rust/10 border border-rust px-3 py-2 mb-4 flex items-center justify-between gap-2">
            <p className="font-mono text-xs text-rust flex-1">{erro}</p>
            <button onClick={() => setErro('')} className="font-mono text-xs text-rust">✕</button>
          </div>
        )}
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
