import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import LoadError from '../../components/LoadError'
import EmptyState from '../../components/EmptyState'
import { relatorioMargem } from '../../api/precificacao'
import { brl } from '../../utils/format'
import { Link } from 'react-router-dom'

const hojeMais = (dias) => {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d.toLocaleDateString('pt-BR')
}

let proximoId = 1

export default function Orcamento() {
  const navigate = useNavigate()
  const [cliente, setCliente] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [validadeDias, setValidadeDias] = useState(7)
  const [observacoes, setObservacoes] = useState('')
  const [itens, setItens] = useState([])
  const [copiado, setCopiado] = useState(false)
  // Pix fica salvo no aparelho pra não redigitar a cada orçamento
  const [pixChave, setPixChave] = useState(() => localStorage.getItem('quantum_pix_chave') || '')
  const [pixNome, setPixNome] = useState(() => localStorage.getItem('quantum_pix_nome') || '')
  const [pixCopiado, setPixCopiado] = useState(false)
  const mudarPix = (setter, storageKey) => (e) => {
    const v = e.target.value
    setter(v)
    try { localStorage.setItem(storageKey, v) } catch { /* modo privado */ }
  }
  const copiarPix = async () => {
    try {
      await navigator.clipboard.writeText(pixChave.trim())
      setPixCopiado(true)
      setTimeout(() => setPixCopiado(false), 2000)
    } catch { /* clipboard indisponível */ }
  }

  const { data: produtos = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['relatorio-margem'],
    queryFn: () => relatorioMargem().then((r) => r.data.produtos),
  })

  const produtoPorId = (id) => produtos.find((p) => p.produto_id === id) || null

  const addItem = () =>
    setItens((prev) => [...prev, { _id: proximoId++, produtoId: '', qtd: 1, preco: '' }])

  const atualizarItem = (id, campo, valor) =>
    setItens((prev) => prev.map((it) => {
      if (it._id !== id) return it
      const novo = { ...it, [campo]: valor }
      // Selecionar o produto pré-preenche o preço com o 1º canal precificado
      if (campo === 'produtoId') {
        const p = produtoPorId(Number(valor))
        novo.preco = p?.canais?.[0]?.preco_praticado ?? ''
      }
      return novo
    }))

  const removerItem = (id) => setItens((prev) => prev.filter((it) => it._id !== id))

  const itensValidos = itens.filter((it) => it.produtoId && parseFloat(it.preco) > 0 && parseInt(it.qtd) > 0)
  const total = itensValidos.reduce((s, it) => s + parseFloat(it.preco) * parseInt(it.qtd), 0)

  const texto = useMemo(() => {
    const linhas = []
    linhas.push('*Orçamento — Quantum*')
    if (cliente.trim()) linhas.push(`Cliente: ${cliente.trim()}`)
    linhas.push('')
    for (const it of itensValidos) {
      const p = produtoPorId(Number(it.produtoId))
      linhas.push(`• ${it.qtd}× ${p?.produto_nome ?? '?'} — ${brl(parseFloat(it.preco))} cada = ${brl(parseFloat(it.preco) * parseInt(it.qtd))}`)
    }
    linhas.push('')
    linhas.push(`*Total: ${brl(total)}*`)
    linhas.push(`Válido até ${hojeMais(parseInt(validadeDias) || 7)}`)
    if (pixChave.trim()) {
      linhas.push('')
      linhas.push('*Pagamento via Pix:*')
      linhas.push(pixChave.trim()) // chave sozinha na linha → fácil copiar no WhatsApp
      if (pixNome.trim()) linhas.push(`(em nome de ${pixNome.trim()})`)
    }
    if (observacoes.trim()) {
      linhas.push('')
      linhas.push(observacoes.trim())
    }
    return linhas.join('\n')
  }, [cliente, itensValidos, total, validadeDias, observacoes, produtos, pixChave, pixNome])

  const linkWhatsApp = () => {
    const fone = whatsapp.replace(/\D/g, '')
    const base = fone ? `https://wa.me/55${fone}` : 'https://wa.me/'
    return `${base}?text=${encodeURIComponent(texto)}`
  }

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch { /* clipboard indisponível — usuário pode selecionar no preview */ }
  }

  return (
    <Layout title="Orçamento" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4 pb-8 space-y-5">
        <div className="print:hidden">
          <p className="eyebrow">Vendas</p>
          <h1 className="title-serif text-3xl">Orçamento</h1>
          <p className="text-sm text-on-surface-dim mt-1">
            Monte a proposta e envie pronta pelo WhatsApp.
          </p>
        </div>
        {isLoading ? <LoadingSpinner /> : isError ? (
          <LoadError onRetry={refetch} />
        ) : produtos.length === 0 ? (
          <EmptyState
            title="Nenhum produto"
            description="Cadastre e precifique produtos para montar orçamentos"
            action={<Link to="/produtos/novo" className="btn-primary inline-block px-4 py-2 text-xs">+ Produto</Link>}
          />
        ) : (
          <>
            <div className="print:hidden space-y-4">
              <div>
                <label className="label" htmlFor="orc-cliente">Cliente</label>
                <input id="orc-cliente" className="input" placeholder="Nome do cliente"
                  value={cliente} onChange={(e) => setCliente(e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="orc-zap">WhatsApp do cliente (opcional)</label>
                <input id="orc-zap" className="input" type="tel" inputMode="tel" placeholder="DDD + número (ex: 11 91234-5678)"
                  value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              </div>

              {/* Itens */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="label mb-0">Itens</p>
                  <button type="button" onClick={addItem}
                    className="font-mono text-xs uppercase tracking-widest text-primary border border-outline-strong rounded-full px-3 py-1 active:bg-surface-2">
                    + Item
                  </button>
                </div>
                {itens.length === 0 && (
                  <p className="font-mono text-xs text-on-surface-dim uppercase tracking-widest text-center py-4">
                    Adicione itens ao orçamento
                  </p>
                )}
                <div className="space-y-2">
                  {itens.map((it) => (
                    <div key={it._id} className="card px-3 py-2 space-y-2">
                      <select className="input text-sm" aria-label="Produto"
                        value={it.produtoId}
                        onChange={(e) => atualizarItem(it._id, 'produtoId', e.target.value)}>
                        <option value="">Selecionar produto…</option>
                        {produtos.map((p) => (
                          <option key={p.produto_id} value={p.produto_id}>{p.produto_nome}</option>
                        ))}
                      </select>
                      <div className="flex gap-2 items-center">
                        <input className="input w-20 text-sm" type="number" min="1" step="1" aria-label="Quantidade"
                          value={it.qtd} onChange={(e) => atualizarItem(it._id, 'qtd', e.target.value)} />
                        <span className="font-mono text-xs text-on-surface-dim">×</span>
                        <div className="relative flex-1">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-xs text-on-surface-dim">R$</span>
                          <input className="input w-full pl-8 text-sm" type="number" min="0" step="0.01" aria-label="Preço unitário"
                            value={it.preco} onChange={(e) => atualizarItem(it._id, 'preco', e.target.value)} />
                        </div>
                        <button type="button" onClick={() => removerItem(it._id)} aria-label="Remover item"
                          className="p-2 text-on-surface-dim active:text-danger flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="label" htmlFor="orc-validade">Válido por (dias)</label>
                  <input id="orc-validade" className="input" type="number" min="1" step="1"
                    value={validadeDias} onChange={(e) => setValidadeDias(e.target.value)} />
                </div>
                <div className="flex-[2]">
                  <label className="label" htmlFor="orc-obs">Observações</label>
                  <input id="orc-obs" className="input" placeholder="Ex: entrega não inclusa"
                    value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
                </div>
              </div>

              {/* Pix — vai no orçamento pra facilitar o pagamento */}
              <div className="card space-y-2">
                <div className="flex items-center justify-between">
                  <p className="label mb-0">Pix para pagamento (opcional)</p>
                  {pixChave.trim() && (
                    <button type="button" onClick={copiarPix}
                      className="font-mono text-[10px] uppercase tracking-widest text-primary border border-outline-strong rounded-full px-3 py-1 active:bg-surface-2">
                      {pixCopiado ? 'Copiado ✓' : 'Copiar chave'}
                    </button>
                  )}
                </div>
                <div>
                  <label className="label" htmlFor="orc-pix-chave">Chave Pix</label>
                  <input id="orc-pix-chave" className="input" placeholder="CPF, celular, e-mail ou aleatória"
                    value={pixChave} onChange={mudarPix(setPixChave, 'quantum_pix_chave')} />
                </div>
                <div>
                  <label className="label" htmlFor="orc-pix-nome">Nome de quem recebe (opcional)</label>
                  <input id="orc-pix-nome" className="input" placeholder="Ex: Maria da Silva"
                    value={pixNome} onChange={mudarPix(setPixNome, 'quantum_pix_nome')} />
                </div>
                <p className="font-sans text-[11px] text-on-surface-dim">
                  Fica salvo neste aparelho e vai no orçamento — o cliente é só tocar e copiar no WhatsApp.
                </p>
              </div>
            </div>

            {/* Preview (também é a área de impressão) */}
            {itensValidos.length > 0 && (
              <div className="card">
                <p className="label mb-2 print:hidden">Pré-visualização</p>
                <pre className="font-sans text-sm text-on-surface whitespace-pre-wrap">{texto.replace(/\*/g, '')}</pre>
              </div>
            )}

            {/* Ações */}
            <div className="print:hidden space-y-2">
              <a
                href={itensValidos.length > 0 ? linkWhatsApp() : undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={itensValidos.length === 0}
                className={`btn-primary block text-center ${itensValidos.length === 0 ? 'opacity-40 pointer-events-none' : ''}`}
              >
                Enviar por WhatsApp
              </a>
              <div className="flex gap-2">
                <button type="button" onClick={copiar} disabled={itensValidos.length === 0} className="btn-ghost flex-1 text-xs py-2">
                  {copiado ? 'Copiado ✓' : 'Copiar texto'}
                </button>
                <button type="button" onClick={() => window.print()} disabled={itensValidos.length === 0} className="btn-ghost flex-1 text-xs py-2">
                  Imprimir / PDF
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
