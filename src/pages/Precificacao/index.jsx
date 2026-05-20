import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal'
import FormField from '../../components/FormField'
import { listarProdutos } from '../../api/produtos'
import { listarCanais, criarCanal } from '../../api/precificacao'
import { listarPrecosProduto, criarPrecoProduto, atualizarPrecoProduto } from '../../api/precificacao'
import { useForm } from 'react-hook-form'

const brl = (v) => `R$ ${Number(v || 0).toFixed(2)}`

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
  const [produtos, setProdutos] = useState([])
  const [canais, setCanais] = useState([])
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [precos, setPrecos] = useState([])
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
    const r = await listarPrecosProduto(id)
    setPrecos(r.data)
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
    <Layout title="Precificação" onBack>
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
