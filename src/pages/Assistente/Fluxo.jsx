import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { processarReceitas } from '../../api/ia'
import { salvarAssistente } from '../../api/assistente'
import { billingStatus } from '../../api/billing'
import StepBar from './StepBar'
import Etapa2Precos from './Etapa2Precos'
import Etapa3Tempo from './Etapa3Tempo'
import Etapa4Preco from './Etapa4Preco'
import { brl } from '../../utils/format'

// ── Fluxo guiado do Assistente — ETAPA 1 (Receita) ─────────────────────────────
// Barra fixa com etapas no topo, conversa do assistente no corpo, usuário
// anexa/digita e a IA devolve pronto pra confirmar. Reusa /ia/receitas (sem
// mudança no backend). Design system Kitchen Metrics · Soft Minimalist.

function Bolha({ children }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center font-serif text-sm font-bold">
        Q
      </div>
      <div className="flex-1 bg-card border border-outline rounded-2xl px-4 py-3">{children}</div>
    </div>
  )
}

// Cabeçalho fixo com voltar + barra de etapas (onBack null → sem seta)
function Topo({ atual, onBack }) {
  return (
    <header className="sticky top-0 z-10 bg-surface border-b border-outline print:hidden">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
        {onBack ? (
          <button onClick={onBack} aria-label="Voltar" className="p-1 -ml-1">
            <svg className="w-5 h-5 text-on-surface" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <div className="w-5" />
        )}
        <div className="flex-1">
          <StepBar atual={atual} />
        </div>
      </div>
    </header>
  )
}

export default function Fluxo() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const inputRef = useRef()

  const [fase, setFase] = useState('intro') // intro | processando | revisao | precos | confirmado
  const [arquivo, setArquivo] = useState(null)
  const [texto, setTexto] = useState('')
  const [receita, setReceita] = useState(null)
  const [precos, setPrecos] = useState(null) // resultado da Etapa 2
  const [mo, setMo] = useState(null)         // resultado da Etapa 3
  const [preco, setPreco] = useState(null)   // resultado da Etapa 4
  const [produtoId, setProdutoId] = useState(null) // id do produto gravado
  const [erroSalvar, setErroSalvar] = useState('')
  const [erroAssinatura, setErroAssinatura] = useState(false) // 402 no salvar
  const [erro, setErro] = useState('')

  // Cada etapa começa do topo (as fases trocam sem mudar de rota,
  // então o ScrollToTop global do App não dispara aqui)
  useEffect(() => { window.scrollTo(0, 0) }, [fase])

  // Freemium: avisa ANTES do trabalho todo se o produto grátis já foi usado
  // (o salvar responderia 402 lá no final — frustração à toa)
  const billingQ = useQuery({
    queryKey: ['billing-status'],
    queryFn: () => billingStatus().then((r) => r.data),
    staleTime: 60_000,
  })
  const limiteAtingido = billingQ.data?.plano === 'gratis' &&
    (billingQ.data.produtos_usados ?? 0) >= (billingQ.data.produtos_limite ?? Infinity)

  const totalTempo = (r) =>
    (r?.etapas_mo || []).reduce((s, e) => s + (parseFloat(e.tempo_min) || 0), 0)

  const processar = async () => {
    if (!arquivo && !texto.trim()) return
    setErro('')
    setFase('processando')
    try {
      const file = arquivo || new File([texto], 'receita.txt', { type: 'text/plain' })
      const r = await processarReceitas(file)
      const rec = (r.data.receitas || [])[0]
      if (!rec) {
        setErro('Não consegui identificar uma receita. Tente uma foto mais nítida ou digite o texto.')
        setFase('intro')
        return
      }
      setReceita({
        nome: rec.nome || '',
        tipo: rec.tipo || '',
        rendimento_g: rec.rendimento_g || 0,
        ingredientes: (rec.ingredientes || []).map((ing) => ({
          nome: ing.nome,
          quantidade_g: ing.quantidade_g,
          unidade_original: ing.unidade_original || null,
        })),
        etapas_mo: rec.etapas_mo || [],
      })
      setFase('revisao')
    } catch (e) {
      setErro(e.message)
      setFase('intro')
    }
  }

  const up = (campo, valor) => setReceita((r) => ({ ...r, [campo]: valor }))
  const voltarHome = () => navigate('/dashboard')

  // Grava tudo no backend (transacional). Chamado ao Finalizar a Etapa 4.
  const finalizar = async (resultado) => {
    setErroSalvar(''); setErroAssinatura(false); setFase('salvando')
    try {
      const payload = {
        nome: receita.nome,
        tipo: receita.tipo || null,
        rendimento_g: Math.max(parseFloat(receita.rendimento_g) || 0, 1),
        porcoes: resultado.porcoes,
        margem_pct: resultado.margem,
        etapas_mo: mo?.contar ? [{ descricao: 'Preparo', tempo_min: mo.tempoMin }] : [],
        ingredientes: precos?.ingredientesPayload || [],
        embalagens: (precos?.embalagens || []).map((e) => ({
          nome: e.nome,
          preco: e.preco,
          quantidade_embalagem: e.quantidade_embalagem,
          quantidade_usada: e.quantidade_usada,
        })),
      }
      const r = await salvarAssistente(payload)
      setProdutoId(r.data.produto_id)
      // os novos dados aparecem nas listas/dashboard (billing-status: contador do plano grátis)
      for (const k of ['produtos', 'ingredientes', 'receitas', 'relatorio-margem', 'canais', 'billing-status']) {
        queryClient.invalidateQueries({ queryKey: [k] })
      }
      setFase('confirmado')
    } catch (e) {
      setErroSalvar(e.message)
      setErroAssinatura(e.status === 402)
      setFase('preco')
    }
  }

  // ── INTRO · limite grátis já usado ───────────────────────────────────────
  if (fase === 'intro' && limiteAtingido) {
    const limite = billingQ.data?.produtos_limite ?? 1
    return (
      <div className="min-h-screen bg-surface">
        <Topo atual={1} onBack={voltarHome} />
        <main className="max-w-xl mx-auto px-4 pt-5 pb-8 space-y-4">
          <Bolha>
            <p className="font-sans text-sm text-on-surface">
              Você já usou {limite === 1 ? 'o seu produto grátis' : `os seus ${limite} produtos grátis`}. 😊
            </p>
            <p className="font-sans text-sm text-on-surface mt-2">
              Pra calcular uma receita nova, é só <strong>assinar</strong> — aí você cria
              quantos produtos quiser. O que você já salvou continua seu.
            </p>
          </Bolha>
          <button onClick={() => navigate('/assinatura')} className="btn-primary">Ver plano →</button>
          <button onClick={voltarHome} className="btn-ghost">Voltar ao início</button>
        </main>
      </div>
    )
  }

  // ── INTRO ────────────────────────────────────────────────────────────────
  if (fase === 'intro') {
    return (
      <div className="min-h-screen bg-surface">
        <Topo atual={1} onBack={voltarHome} />
        <main className="max-w-xl mx-auto px-4 pt-5 pb-28 space-y-4">
          <Bolha>
            <p className="font-sans text-sm text-on-surface">
              Vamos lá! Primeiro me mostra a <strong>receita</strong> do que você quer
              vender. Pode mandar uma foto, um print, um PDF — ou escrever aqui.
            </p>
            <p className="font-sans text-sm text-on-surface mt-2">Eu leio e organizo tudo. 📸</p>
          </Bolha>

          {erro && (
            <div className="bg-danger-bg text-on-danger-bg rounded-xl px-3 py-2">
              <p className="font-sans text-sm">{erro}</p>
            </div>
          )}

          <button
            onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed border-outline bg-surface-1 rounded-2xl flex flex-col items-center justify-center py-10 active:bg-surface-2"
          >
            <svg className="w-9 h-9 text-secondary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="font-sans text-sm font-semibold text-on-surface-dim">
              {arquivo ? arquivo.name : 'Tirar foto ou anexar'}
            </p>
            <p className="font-mono text-[10px] text-on-surface-dim mt-1">Foto, PDF, Excel, CSV</p>
          </button>

          <input ref={inputRef} type="file"
            accept="image/*,application/pdf,.xlsx,.xls,.csv,.txt"
            className="hidden"
            onChange={(e) => setArquivo(e.target.files[0] || null)} />

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-outline" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-dim">ou escreva</span>
            <div className="flex-1 border-t border-outline" />
          </div>

          <textarea className="input w-full h-28 text-sm"
            placeholder={'Ex: Bolo de cenoura\n3 ovos, 2 xícaras de açúcar, 1 xícara de óleo,\n3 cenouras médias, 2 xícaras de farinha...'}
            value={texto} onChange={(e) => setTexto(e.target.value)} />
        </main>

        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline px-4 py-3 z-30">
          <button onClick={processar} disabled={!arquivo && !texto.trim()}
            className="btn-primary max-w-xl mx-auto block">
            Ler minha receita
          </button>
        </div>
      </div>
    )
  }

  // ── PROCESSANDO ──────────────────────────────────────────────────────────
  if (fase === 'processando') {
    return (
      <div className="min-h-screen bg-surface">
        <Topo atual={1} onBack={voltarHome} />
        <main className="max-w-xl mx-auto px-4 pt-5 space-y-4">
          <Bolha>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
              <p className="font-sans text-sm text-on-surface">Tô lendo e organizando os ingredientes...</p>
            </div>
          </Bolha>
        </main>
      </div>
    )
  }

  // ── REVISÃO ──────────────────────────────────────────────────────────────
  if (fase === 'revisao') {
    return (
      <div className="min-h-screen bg-surface">
        <Topo atual={1} onBack={() => setFase('intro')} />
        <main className="max-w-xl mx-auto px-4 pt-5 pb-28 space-y-4">
          <Bolha>
            <p className="font-sans text-sm text-on-surface">
              Pronto! Entendi assim 👇 Confere e ajusta o que precisar — depois é só confirmar.
            </p>
          </Bolha>

          <div className="border border-outline-strong rounded-xl bg-card overflow-hidden">
            <div className="p-3 border-b border-outline space-y-2">
              <div>
                <p className="label">Nome</p>
                <input className="input w-full text-sm font-medium" value={receita.nome}
                  aria-label="Nome da receita" onChange={(e) => up('nome', e.target.value)} />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="label">Categoria</p>
                  <input className="input w-full text-xs" placeholder="opcional" value={receita.tipo}
                    aria-label="Categoria" onChange={(e) => up('tipo', e.target.value)} />
                </div>
                <div className="w-28">
                  <p className="label">Rende</p>
                  <div className="relative">
                    <input type="number" className="input w-full text-xs pr-5" value={receita.rendimento_g}
                      aria-label="Rendimento em gramas" onChange={(e) => up('rendimento_g', e.target.value)} />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-on-surface-dim">g</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 border-b border-outline">
              <p className="label mb-2">Ingredientes ({receita.ingredientes.length})</p>
              <div className="space-y-1.5">
                {receita.ingredientes.map((ing, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    <span className="font-sans text-sm text-on-surface flex-1 truncate">{ing.nome}</span>
                    <span className="qtm-num text-xs text-on-surface-dim">{ing.unidade_original || `${ing.quantidade_g}g`}</span>
                  </div>
                ))}
              </div>
            </div>

            {receita.etapas_mo.length > 0 && (
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="label">Modo de preparo ({receita.etapas_mo.length} etapas)</p>
                  <span className="qtm-num text-xs text-on-surface">~{totalTempo(receita)}min</span>
                </div>
                <div className="space-y-1.5">
                  {receita.etapas_mo.map((e, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="qtm-num text-[11px] text-on-surface-dim w-9 flex-shrink-0">{e.tempo_min}min</span>
                      <span className="font-sans text-xs text-on-surface">{e.descricao}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline px-4 py-3 z-30">
          <button onClick={() => setFase('precos')} disabled={!receita.nome}
            className="btn-primary max-w-xl mx-auto block">
            Confirmar receita →
          </button>
        </div>
      </div>
    )
  }

  // ── ETAPA 2 — PREÇOS ───────────────────────────────────────────────────────
  if (fase === 'precos') {
    return (
      <div className="min-h-screen bg-surface">
        <Topo atual={2} onBack={() => setFase('revisao')} />
        <Etapa2Precos
          receita={receita}
          onConcluir={(resultado) => { setPrecos(resultado); setFase('tempo') }}
        />
      </div>
    )
  }

  // ── ETAPA 3 — TEMPO / MÃO DE OBRA ──────────────────────────────────────────
  if (fase === 'tempo') {
    return (
      <div className="min-h-screen bg-surface">
        <Topo atual={3} onBack={() => setFase('precos')} />
        <Etapa3Tempo
          receita={receita}
          onConcluir={(resultado) => { setMo(resultado); setFase('preco') }}
        />
      </div>
    )
  }

  // ── ETAPA 4 — PREÇO FINAL ──────────────────────────────────────────────────
  if (fase === 'preco') {
    return (
      <div className="min-h-screen bg-surface">
        <Topo atual={4} onBack={() => setFase('tempo')} />
        <Etapa4Preco
          receita={receita}
          custoTotal={(precos?.totalReceita || 0) + (mo?.custoMO || 0)}
          embalagens={precos?.embalagens || []}
          erro={erroSalvar}
          erroAssinatura={erroAssinatura}
          inicial={preco}
          onAssinar={() => navigate('/assinatura')}
          onConcluir={(resultado) => { setPreco(resultado); finalizar(resultado) }}
        />
      </div>
    )
  }

  // ── SALVANDO ───────────────────────────────────────────────────────────────
  if (fase === 'salvando') {
    return (
      <div className="min-h-screen bg-surface">
        <Topo atual={4} onBack={null} />
        <main className="max-w-xl mx-auto px-4 pt-5">
          <Bolha>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
              <p className="font-sans text-sm text-on-surface">Gravando tudo: ingredientes, receita, produto e preço…</p>
            </div>
          </Bolha>
        </main>
      </div>
    )
  }

  // ── CONFIRMADO (fluxo completo · falta o "salvar tudo") ────────────────────
  const custoMP = precos?.totalReceita || 0
  const custoMO = mo?.custoMO || 0
  const custoTotal = custoMP + custoMO
  const limpar = () => { setFase('intro'); setArquivo(null); setTexto(''); setReceita(null); setPrecos(null); setMo(null); setPreco(null); setProdutoId(null); setErroSalvar(''); setErroAssinatura(false) }
  return (
    <div className="min-h-screen bg-surface">
      {/* voltar leva pro início — voltar à Etapa 4 permitiria salvar duplicado */}
      <Topo atual={4} onBack={voltarHome} />
      <main className="max-w-xl mx-auto px-4 pt-5 pb-28 space-y-4">
        <Bolha>
          <p className="font-sans text-sm text-on-surface">
            Prontinho! 🎉 Salvei o <strong>{receita.nome}</strong> — já está no seu app com
            ingredientes, receita, produto e preço.
          </p>
        </Bolha>

        {/* Preço de venda em destaque */}
        <div className="bg-primary text-on-primary rounded-2xl px-4 py-5 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-primary/60 mb-1">
            Preço de venda{preco?.porcoes > 1 ? ' (por unidade)' : ''}
          </p>
          <p className="qtm-num text-4xl font-bold text-accent-soft">{brl(preco?.precoDireto || 0)}</p>
          <p className="font-mono text-[11px] text-on-primary/70 mt-1">
            custo {brl(preco?.custoUnit || 0)} · lucro {brl(preco?.lucroDireto || 0)} · margem {preco?.margem}%
          </p>
        </div>

        {/* Resumo de custo */}
        <div className="border border-outline rounded-xl bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-outline">
            <span className="font-sans text-sm text-on-surface">Matéria-prima</span>
            <span className="qtm-num text-sm text-on-surface">{brl(custoMP)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="font-sans text-sm text-on-surface">Mão de obra ({mo?.tempoMin || 0}min)</span>
            <span className="qtm-num text-sm text-on-surface">{brl(custoMO)}</span>
          </div>
        </div>

        {produtoId && (
          <button onClick={() => navigate(`/produtos/${produtoId}`)} className="btn-primary">
            Ver produto no app →
          </button>
        )}
        <button onClick={limpar} className="btn-secondary">Montar outro produto</button>
        <button onClick={voltarHome} className="btn-ghost">Voltar ao início</button>
      </main>
    </div>
  )
}
