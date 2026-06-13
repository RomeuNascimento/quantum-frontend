import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import FormField from '../../components/FormField'
import EmptyState from '../../components/EmptyState'
import CustoLineChart from '../../components/CustoLineChart'
import MargemBadge from '../../components/MargemBadge'
import { listarProdutos, historicoCustoProduto } from '../../api/produtos'
import { listarCanais, criarCanal, atualizarCanal, deletarCanal } from '../../api/precificacao'
import { listarPrecosProduto, criarPrecoProduto, atualizarPrecoProduto } from '../../api/precificacao'
import { useForm } from 'react-hook-form'

import { brl } from '../../utils/format'

const MARGEM_PADRAO = 50
const pctStr = (v) => `${Math.max(0, v).toFixed(0)}%`
const taxasCanal = (c) => c.taxa_plataforma_pct + c.taxa_cartao_pct + c.imposto_pct
const calcSugerido = (custo, margem, canal) => {
  const div = 1 - (margem + taxasCanal(canal)) / 100
  return div > 0 ? custo / div : 0
}

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
          <span className="font-mono text-[9px] text-mute uppercase tracking-widest">Custo {pctStr((custoR / preco) * 100)}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-lime inline-block flex-shrink-0" />
          <span className="font-mono text-[9px] text-mute uppercase tracking-widest">Margem {pctStr(pp.margem_pct)}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-line border border-ink/20 inline-block flex-shrink-0" />
          <span className="font-mono text-[9px] text-mute uppercase tracking-widest">Taxas {pctStr((taxasR / preco) * 100)}</span>
        </span>
      </div>
    </div>
  )
}

export default function Precificacao() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [showModalCanal, setShowModalCanal] = useState(false)
  const [editCanal, setEditCanal] = useState(null)
  const [confirmCanal, setConfirmCanal] = useState(null) // canal a excluir
  const [showModalPreco, setShowModalPreco] = useState(false)
  const [canalModal, setCanalModal] = useState(null)      // canal sendo precificado
  const [editPreco, setEditPreco] = useState(null)        // preço existente (ou null = novo)
  const [erro, setErro] = useState('')

  const { register: regCanal, handleSubmit: submitCanal, reset: resetCanal, setValue: setCanalValue } = useForm()
  const { register: regPreco, handleSubmit: submitPreco, reset: resetPreco } = useForm()

  const produtosQ = useQuery({
    queryKey: ['produtos'],
    queryFn: () => listarProdutos().then((r) => r.data),
  })
  const canaisQ = useQuery({
    queryKey: ['canais'],
    queryFn: () => listarCanais().then((r) => r.data),
  })

  // ['precos-produto', id]: trocar de produto troca a chave (sem race manual)
  const precosQ = useQuery({
    queryKey: ['precos-produto', produtoSelecionado],
    enabled: produtoSelecionado != null,
    queryFn: async () => {
      const [r, h] = await Promise.all([
        listarPrecosProduto(produtoSelecionado),
        historicoCustoProduto(produtoSelecionado),
      ])
      return { precos: r.data, historico: h.data.pontos || [] }
    },
  })

  const produtos = produtosQ.data ?? []
  const canais = canaisQ.data ?? []
  const precos = precosQ.data?.precos ?? []
  const historico = precosQ.data?.historico ?? []
  const loading = produtosQ.isLoading || canaisQ.isLoading

  // Custo do produto: dos preços já existentes, senão do último ponto do histórico
  const custoProduto = precos[0]?.custo_total
    ?? (historico.length ? historico[historico.length - 1].custo : null)

  const selecionarProduto = (id) => setProdutoSelecionado(Number(id))

  useEffect(() => {
    if (produtos.length > 0 && produtoSelecionado == null) {
      setProdutoSelecionado(produtos[0].id)
    }
  }, [produtos, produtoSelecionado])

  useEffect(() => {
    const e = produtosQ.error || canaisQ.error || precosQ.error
    if (e) setErro(e.message)
  }, [produtosQ.error, canaisQ.error, precosQ.error])

  const salvarCanalM = useMutation({
    mutationFn: ({ canalId, payload }) =>
      canalId ? atualizarCanal(canalId, payload) : criarCanal(payload),
    onSuccess: () => {
      resetCanal()
      queryClient.invalidateQueries({ queryKey: ['canais'] })
      queryClient.invalidateQueries({ queryKey: ['precos-produto', produtoSelecionado] })
      queryClient.invalidateQueries({ queryKey: ['relatorio-margem'] })
    },
    onError: (e) => setErro(e.message),
    onSettled: () => { setShowModalCanal(false); setEditCanal(null) },
  })

  const onSalvarCanal = (dados) =>
    salvarCanalM.mutate({
      canalId: editCanal?.id,
      payload: {
        nome: dados.nome,
        taxa_plataforma_pct: parseFloat(dados.taxa_plataforma_pct) || 0,
        taxa_cartao_pct: parseFloat(dados.taxa_cartao_pct) || 0,
        imposto_pct: parseFloat(dados.imposto_pct) || 0,
      },
    })

  const deletarCanalM = useMutation({
    mutationFn: (canalId) => deletarCanal(canalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canais'] })
      queryClient.invalidateQueries({ queryKey: ['precos-produto', produtoSelecionado] })
      queryClient.invalidateQueries({ queryKey: ['relatorio-margem'] })
    },
    onError: (e) => setErro(e.message),
    onSettled: () => { setShowModalCanal(false); setEditCanal(null) },
  })

  const abrirNovoCanal = () => {
    setEditCanal(null)
    resetCanal({ nome: '', taxa_plataforma_pct: '', taxa_cartao_pct: '', imposto_pct: '' })
    setShowModalCanal(true)
  }

  const abrirEditarCanal = (c) => {
    setEditCanal(c)
    setCanalValue('nome', c.nome)
    setCanalValue('taxa_plataforma_pct', c.taxa_plataforma_pct)
    setCanalValue('taxa_cartao_pct', c.taxa_cartao_pct)
    setCanalValue('imposto_pct', c.imposto_pct)
    setShowModalCanal(true)
  }

  const salvarPrecoM = useMutation({
    mutationFn: ({ precoId, payload }) =>
      precoId
        ? atualizarPrecoProduto(produtoSelecionado, precoId, payload)
        : criarPrecoProduto(produtoSelecionado, payload),
    onSuccess: () => {
      resetPreco()
      queryClient.invalidateQueries({ queryKey: ['precos-produto', produtoSelecionado] })
      queryClient.invalidateQueries({ queryKey: ['relatorio-margem'] })
    },
    onError: (e) => setErro(e.message),
    onSettled: () => { setShowModalPreco(false); setEditPreco(null); setCanalModal(null) },
  })

  // Abre o ajuste de margem para um canal específico (não pede "escolher canal")
  const abrirPreco = (canal, pp) => {
    setCanalModal(canal)
    setEditPreco(pp || null)
    resetPreco({
      margem_pct: pp?.margem_pct ?? MARGEM_PADRAO,
      preco_final: pp?.preco_final || '',
    })
    setShowModalPreco(true)
  }

  const onSalvarPreco = (dados) =>
    salvarPrecoM.mutate({
      precoId: editPreco?.id,
      payload: {
        canal_id: canalModal.id,
        margem_pct: parseFloat(dados.margem_pct),
        preco_final: dados.preco_final ? parseFloat(dados.preco_final) : null,
      },
    })

  return (
    <Layout title="Precificação" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4">
        {erro && (
          <div className="bg-rust/10 border border-rust px-3 py-2 mb-4 flex items-center justify-between gap-2">
            <p className="font-sans text-sm text-rust flex-1">{erro}</p>
            <button onClick={() => setErro('')} className="font-mono text-xs text-rust">✕</button>
          </div>
        )}
        {loading ? <LoadingSpinner /> : produtos.length === 0 ? (
          <EmptyState
            title="Nenhum produto"
            description="Cadastre um produto para calcular o preço de venda"
            action={<Link to="/produtos/novo" className="btn-primary inline-block px-4 py-2 text-xs">+ Produto</Link>}
          />
        ) : (
          <>
            {/* Produto primeiro */}
            <FormField label="Produto">
              <select className="input" value={produtoSelecionado || ''} onChange={(e) => selecionarProduto(e.target.value)}>
                {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </FormField>

            {/* Evolução do custo */}
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

            {/* Preço de venda por canal */}
            <p className="label mt-4 mb-1">Preço de venda</p>
            <p className="text-xs text-mute mb-3">
              Toque num canal pra ajustar a margem. O preço sugerido já desconta as taxas de cada lugar.
            </p>

            {precosQ.isLoading ? (
              <div className="py-6"><LoadingSpinner /></div>
            ) : custoProduto == null ? (
              <div className="border border-line py-8 px-4 text-center">
                <p className="font-mono text-xs uppercase tracking-widest text-mute mb-3">
                  Este produto ainda não tem custo
                </p>
                <Link to={`/produtos/${produtoSelecionado}`} className="btn-ghost w-auto inline-block px-6 py-2 text-xs">
                  Editar produto
                </Link>
              </div>
            ) : (
              canais.map((canal) => {
                const pp = precos.find((p) => p.canal_id === canal.id)
                const margem = pp?.margem_pct ?? MARGEM_PADRAO
                const sugerido = pp?.preco_sugerido ?? calcSugerido(custoProduto, margem, canal)
                const view = pp ?? { preco_sugerido: sugerido, custo_total: custoProduto, margem_pct: margem }
                return (
                  <button key={canal.id} onClick={() => abrirPreco(canal, pp)} className="card w-full text-left mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-sans font-semibold text-ink text-sm">{canal.nome}</span>
                      {pp
                        ? <MargemBadge margem={margem} />
                        : <span className="font-mono text-[9px] uppercase tracking-widest text-mute border border-line px-1.5 py-0.5">Prévia · margem {margem}%</span>}
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="label">Custo total</p>
                        <p className="qtm-num text-sm text-ink">{brl(view.custo_total)}</p>
                      </div>
                      <div className="text-center">
                        <p className="label">Sugerido</p>
                        <p className="qtm-num text-base font-bold text-ink bg-lime px-2">{brl(sugerido)}</p>
                      </div>
                      <div className="text-right">
                        <p className="label">Manual</p>
                        <p className="qtm-num text-sm text-mute">{pp?.preco_final ? brl(pp.preco_final) : '—'}</p>
                      </div>
                    </div>
                    <PrecoDecomposicao pp={view} />
                  </button>
                )
              })
            )}

            {/* Onde você vende (taxas) — secundário */}
            <div className="mt-8 pt-4 border-t border-line">
              <div className="flex items-center justify-between mb-1">
                <p className="label">Onde você vende</p>
                <button
                  onClick={abrirNovoCanal}
                  className="font-mono text-xs uppercase tracking-widest text-ink border border-ink px-3 py-1"
                >
                  + Novo canal
                </button>
              </div>
              <p className="text-xs text-mute mb-3">
                Cada lugar cobra taxas diferentes (sua loja, iFood...). Toque pra editar as taxas.
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {canais.map((c) => (
                  <button key={c.id} onClick={() => abrirEditarCanal(c)}
                    className="flex-shrink-0 card text-left px-3 py-2 min-w-[140px] active:bg-line/40">
                    <p className="font-sans font-semibold text-ink text-sm">{c.nome}</p>
                    <p className="qtm-num text-xs text-mute">Plataforma: {c.taxa_plataforma_pct}%</p>
                    <p className="qtm-num text-xs text-mute">Cartão: {c.taxa_cartao_pct}%</p>
                    <p className="qtm-num text-xs text-mute">Imposto: {c.imposto_pct}%</p>
                    <p className="font-mono text-[9px] text-mute uppercase tracking-widest mt-1">Toque p/ editar</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal canal — cria ou edita taxas */}
      <Modal isOpen={showModalCanal} onClose={() => { setShowModalCanal(false); setEditCanal(null) }}
        title={editCanal ? 'Editar canal' : 'Novo canal'}>
        <form onSubmit={submitCanal(onSalvarCanal)} className="space-y-3">
          <FormField label="Nome"><input className="input" {...regCanal('nome', { required: true })} /></FormField>
          <FormField label="Taxa plataforma (%)"><input className="input" type="number" step="0.01" {...regCanal('taxa_plataforma_pct')} /></FormField>
          <FormField label="Taxa cartão (%)"><input className="input" type="number" step="0.01" {...regCanal('taxa_cartao_pct')} /></FormField>
          <FormField label="Imposto (%)"><input className="input" type="number" step="0.01" {...regCanal('imposto_pct')} /></FormField>
          <button type="submit" className="btn-primary" disabled={salvarCanalM.isPending}>
            {editCanal ? 'Salvar alterações' : 'Criar canal'}
          </button>
          {editCanal && (
            <button type="button"
              onClick={() => { setConfirmCanal(editCanal); setShowModalCanal(false) }}
              className="w-full font-mono text-xs uppercase tracking-widest text-rust border border-rust py-2"
              disabled={deletarCanalM.isPending}>
              Excluir canal
            </button>
          )}
        </form>
      </Modal>

      {/* Modal preço — canal já vem definido pelo card */}
      <Modal isOpen={showModalPreco} onClose={() => { setShowModalPreco(false); setEditPreco(null); setCanalModal(null) }}
        title={canalModal ? `Preço — ${canalModal.nome}` : 'Preço'}>
        <form onSubmit={submitPreco(onSalvarPreco)} className="space-y-3">
          {canalModal && custoProduto != null && (
            <p className="text-xs text-mute -mt-1">
              Custo do produto: <span className="qtm-num">{brl(custoProduto)}</span> · Taxas deste canal:{' '}
              <span className="qtm-num">{taxasCanal(canalModal)}%</span>
            </p>
          )}
          <FormField label="Margem desejada (%)">
            <input className="input" type="number" step="0.1" {...regPreco('margem_pct', { required: true })} />
          </FormField>
          <FormField label="Preço final manual (opcional)">
            <input className="input" type="number" step="0.01" placeholder="Deixe em branco para usar o sugerido"
              {...regPreco('preco_final')} />
          </FormField>
          <button type="submit" className="btn-primary" disabled={salvarPrecoM.isPending}>Salvar</button>
        </form>
      </Modal>

      {/* Confirmação de exclusão de canal */}
      <ConfirmDialog
        isOpen={confirmCanal != null}
        onClose={() => setConfirmCanal(null)}
        onConfirm={() => { deletarCanalM.mutate(confirmCanal.id); setConfirmCanal(null) }}
        title="Excluir canal"
        message={`Remover o canal "${confirmCanal?.nome}"? Os preços cadastrados nele deixam de aparecer.`}
        confirmLabel="Excluir"
      />
    </Layout>
  )
}
