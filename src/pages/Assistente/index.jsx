import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import BottomNav from '../../components/BottomNav'
import { getMe } from '../../api/auth'
import { listarProdutos } from '../../api/produtos'
import { relatorioMargem } from '../../api/precificacao'
import useAuthStore from '../../store/authStore'

// ── Assistente Quantum — TELA PRINCIPAL (hub) ──────────────────────────────────
// Porta de entrada do app. Hero escuro com o assistente + CTA primário "Nova
// precificação" (abre o fluxo guiado). Corpo claro com atalhos e os produtos do
// usuário. Design system Quantum: cantos vivos, lime/ink/bone, mono nos números.

function saudacao() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function Assistente() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const meQ = useQuery({ queryKey: ['me'], queryFn: () => getMe().then((r) => r.data) })
  const produtosQ = useQuery({ queryKey: ['produtos'], queryFn: () => listarProdutos().then((r) => r.data) })
  const margemQ = useQuery({
    queryKey: ['relatorio-margem'],
    queryFn: () => relatorioMargem().then((r) => r.data.produtos),
  })

  const nome = (meQ.data?.nome || user?.nome || '').split(' ')[0]
  const produtos = produtosQ.data ?? []
  const margens = margemQ.data ?? []
  const alertas = margens.filter((p) => p.canais.some((c) => c.margem_real_pct < 10)).length

  return (
    <div className="min-h-screen bg-bone">
      {/* ── HERO (ink) ──────────────────────────────────────────────────────── */}
      <header className="bg-ink text-bone print:hidden">
        <div className="max-w-xl mx-auto px-5 pt-5 pb-6">
          {/* topo: wordmark + config */}
          <div className="flex items-center justify-between mb-7">
            <span className="font-mono text-sm uppercase tracking-[0.3em] text-bone">Quantum</span>
            <Link to="/configuracoes" aria-label="Configurações" className="p-1 -mr-1 text-mute active:text-lime">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>

          {/* fala do assistente */}
          <div className="flex gap-3 mb-6">
            <div className="w-9 h-9 flex-shrink-0 bg-lime text-ink flex items-center justify-center font-mono text-base font-bold">
              Q
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-mute">
                {saudacao()}{nome ? `, ${nome}` : ''}
              </p>
              <h1 className="text-2xl font-bold font-sans leading-tight text-bone">
                O que vamos<br />precificar hoje?
              </h1>
            </div>
          </div>

          {/* CTA primário */}
          <button
            onClick={() => navigate('/assistente/novo')}
            className="w-full bg-lime text-ink flex items-center gap-3 px-5 py-4 active:bg-lime-dim"
          >
            <span className="font-mono text-2xl leading-none font-bold">+</span>
            <div className="flex-1 text-left">
              <p className="font-mono text-sm font-bold uppercase tracking-widest">Nova precificação</p>
              <p className="font-mono text-[10px] tracking-wide text-ink/70">
                Receita · preços · tempo · preço final
              </p>
            </div>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── CORPO (bone) ────────────────────────────────────────────────────── */}
      <main className="max-w-xl mx-auto px-5 pt-6 pb-24 space-y-7">
        {/* Alerta de margem */}
        {alertas > 0 && (
          <Link to="/relatorio" className="flex items-center gap-3 bg-rust text-bone px-4 py-3 active:opacity-80">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-mono text-xs font-bold uppercase tracking-widest flex-1">
              {alertas === 1 ? '1 produto precisa de reajuste' : `${alertas} produtos precisam de reajuste`}
            </p>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Atalhos rápidos */}
        <section>
          <p className="label mb-3">Atalhos</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/ingredientes/importar-nota', label: 'Importar nota', sub: 'Foto da nota fiscal' },
              { to: '/relatorio', label: 'Relatório', sub: 'Margem por produto' },
              { to: '/orcamento', label: 'Orçamento', sub: 'Enviar por WhatsApp' },
              { to: '/lista-compras', label: 'Lista de compras', sub: 'Do que comprar' },
            ].map((a) => (
              <Link key={a.to} to={a.to}
                className="border border-ink bg-bone px-3 py-3 active:bg-ink active:text-bone group">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink group-active:text-bone">{a.label}</p>
                <p className="font-mono text-[10px] text-mute group-active:text-bone/70 mt-0.5">{a.sub}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Seus produtos */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="label mb-0">Seus produtos</p>
            <Link to="/produtos" className="font-mono text-[10px] uppercase tracking-widest text-mute active:text-ink">
              Ver todos →
            </Link>
          </div>

          {produtosQ.isLoading ? (
            <p className="font-mono text-xs text-mute py-3">Carregando…</p>
          ) : produtos.length === 0 ? (
            <div className="border border-dashed border-line px-4 py-6 text-center">
              <p className="font-sans text-sm text-mute">
                Nenhum produto ainda. Toque em <strong className="text-ink">Nova precificação</strong> e
                deixe a IA montar o primeiro com você.
              </p>
            </div>
          ) : (
            <div>
              {produtos.slice(0, 6).map((p) => (
                <Link key={p.id} to={`/produtos/${p.id}`}
                  className="flex items-center justify-between border-b border-line py-3 last:border-b-0">
                  <span className="text-sm font-medium text-ink">{p.nome}</span>
                  <svg className="w-4 h-4 text-mute" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
