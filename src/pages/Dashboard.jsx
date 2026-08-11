import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { getMe } from '../api/auth'
import { listarProdutos } from '../api/produtos'
import { resumoCustosFixos } from '../api/custosFixos'
import { relatorioMargem } from '../api/precificacao'
import { billingStatus } from '../api/billing'
import useAuthStore from '../store/authStore'
import { brl } from '../utils/format'

const ferramentas = [
  { to: '/orcamento', label: 'Orçamento', sub: 'Enviar por WhatsApp',
    icon: <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" /> },
  { to: '/relatorio', label: 'Relatório', sub: 'Margem por produto',
    icon: <path d="M7 16V9m5 7V5m5 11v-4M4 20h16" /> },
  { to: '/lista-compras', label: 'Lista de compras', sub: 'Do que comprar',
    icon: <path d="M5 8h14M5 8a2 2 0 100-4 2 2 0 000 4zm0 0v10a2 2 0 002 2h10a2 2 0 002-2V8M9 12l2 2 4-4" /> },
  { to: '/ponto-equilibrio', label: 'Ponto de equilíbrio', sub: 'Quanto faturar',
    icon: <path d="M3 17l6-6 4 4 8-8m0 0h-5m5 0v5" /> },
  { to: '/embalagens', label: 'Embalagens', sub: 'Caixas e sacos',
    icon: <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /> },
  { to: '/custos-fixos', label: 'Custos fixos', sub: 'Aluguel, luz…',
    icon: <path d="M3 10h18M7 15h1m4 0h1m-8 4h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z" /> },
]

const stroke = { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' }

export default function Dashboard() {
  const { user, setUser } = useAuthStore()

  const meQ = useQuery({ queryKey: ['me'], queryFn: () => getMe().then((r) => r.data) })
  const produtosQ = useQuery({ queryKey: ['produtos'], queryFn: () => listarProdutos().then((r) => r.data) })
  const resumoQ = useQuery({ queryKey: ['custos-fixos-resumo'], queryFn: () => resumoCustosFixos().then((r) => r.data) })
  const margemQ = useQuery({ queryKey: ['relatorio-margem'], queryFn: () => relatorioMargem().then((r) => r.data.produtos) })
  const billingQ = useQuery({ queryKey: ['billing-status'], queryFn: () => billingStatus().then((r) => r.data) })

  useEffect(() => {
    if (meQ.data) setUser(meQ.data)
  }, [meQ.data, setUser])

  const produtos = produtosQ.data ?? null
  const erroProdutos = produtosQ.isError
  const erroResumo = resumoQ.isError
  const margens = margemQ.data ?? []

  // Resumo de margem (média do pior canal por produto + contagem por faixa)
  const stats = useMemo(() => {
    const comCanais = margens.filter((p) => p.canais.length > 0)
    if (!comCanais.length) return null
    const piores = comCanais.map((p) => Math.min(...p.canais.map((c) => c.margem_real_pct)))
    const media = piores.reduce((a, b) => a + b, 0) / piores.length
    return {
      media,
      saudaveis: piores.filter((m) => m >= 30).length,
      revisar: piores.filter((m) => m < 10).length,
    }
  }, [margens])

  const margemAlerta = useMemo(
    () => margens.filter((p) => p.canais.some((c) => c.margem_real_pct < 10)),
    [margens],
  )

  const totalMensal = resumoQ.data?.total_mensal ?? null
  const listaProdutos = produtos ?? []

  const usados = billingQ.data?.produtos_usados ?? 0
  const limite = billingQ.data?.produtos_limite ?? 1
  const unidadeProd = limite === 1 ? 'produto' : 'produtos'
  const pctUso = Math.min(100, (usados / Math.max(1, limite)) * 100)

  return (
    <Layout title="Quantum">
      <div className="px-4 pt-4 space-y-5">
        {/* Saudação */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl title-serif">Olá, {user?.nome?.split(' ')[0] || '...'}</h2>
            <p className="text-sm text-on-surface-dim mt-0.5">Suas métricas estão atualizadas para hoje.</p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/ajuda" aria-label="Ajuda e suporte" className="flex items-center justify-center w-10 h-10 rounded-full border border-outline text-on-surface-dim active:bg-surface-1">
              <svg className="w-5 h-5" {...stroke}>
                <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
            <Link to="/configuracoes" aria-label="Configurações" className="flex items-center justify-center w-10 h-10 rounded-full border border-outline text-on-surface-dim active:bg-surface-1">
              <svg className="w-5 h-5" {...stroke}>
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Hero — Novo cálculo (card branco + CTA navy) */}
        <div className="card">
          <p className="font-serif italic text-on-surface-dim text-sm mb-1">Novo cálculo</p>
          <h3 className="text-lg font-semibold text-on-surface leading-snug mb-4">
            Descubra quanto cobrar pela sua receita — é só mandar e eu faço as contas.
          </h3>
          <Link to="/assistente/novo" className="btn-primary flex items-center justify-center gap-2">
            Calcular meu preço
            <svg className="w-4 h-4" {...stroke}><path d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>

        {/* Atualizar preços — manda a nota, a IA cruza com o catálogo */}
        <Link to="/ingredientes/importar-nota" className="card flex items-center gap-4 active:bg-surface-1">
          <span className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-surface-2 text-primary">
            <svg className="w-5 h-5" {...stroke}>
              <path d="M9 14l2 2 4-4m5 6V4a1 1 0 00-1-1H6a1 1 0 00-1 1v16l2.5-1.5L10 20l2.5-1.5L15 20l2.5-1.5L20 20z" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-on-surface">Atualizar preços</p>
            <p className="text-sm text-on-surface-dim">Mande a notinha · a IA atualiza os preços</p>
          </div>
          <svg className="w-4 h-4 text-on-surface-dim flex-shrink-0" {...stroke}><path d="M9 5l7 7-7 7" /></svg>
        </Link>

        {/* Alerta de margem corroída */}
        {margemAlerta.length > 0 && (
          <Link to="/relatorio" className="flex items-start gap-3 bg-danger-bg border border-danger/30 rounded-xl px-4 py-3.5 active:opacity-80">
            <svg className="w-5 h-5 flex-shrink-0 text-danger mt-0.5" {...stroke}>
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-on-danger-bg">Reajuste necessário</p>
              <p className="text-xs text-on-danger-bg/80 mt-0.5">
                {margemAlerta.length === 1 ? '1 produto precisa' : `${margemAlerta.length} produtos precisam`} de atenção — a margem caiu abaixo de 10%.
              </p>
            </div>
          </Link>
        )}

        {/* Cards resumo */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/produtos" className="card active:bg-surface-1">
            <p className="label">Produtos</p>
            <p className="qtm-num text-3xl font-bold text-primary mt-1">
              {erroProdutos ? '—' : produtos === null ? '…' : produtos.length}
            </p>
          </Link>
          <Link to="/custos-fixos" className="card active:bg-surface-1">
            <p className="label">Custos/mês</p>
            <p className={`qtm-num text-2xl font-bold mt-1.5 ${totalMensal > 0 ? 'text-danger' : 'text-primary'}`}>
              {erroResumo ? '—' : totalMensal === null ? '…' : brl(totalMensal)}
            </p>
          </Link>
        </div>

        {/* Card navy — resumo de margem */}
        {stats && (
          <Link to="/relatorio" className="block rounded-2xl bg-primary text-on-primary p-6 active:brightness-125 transition-all">
            <p className="font-mono text-[11px] uppercase tracking-widest text-on-primary/60">Margem média do catálogo</p>
            <p className="qtm-num text-4xl font-bold mt-1">{stats.media.toFixed(1)}%</p>
            <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-on-primary/60">Saudáveis</p>
                <p className="qtm-num text-lg font-semibold text-positive mt-0.5">{stats.saudaveis}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-on-primary/60">Revisar</p>
                <p className="qtm-num text-lg font-semibold text-danger mt-0.5">{stats.revisar}</p>
              </div>
              <div className="flex-1 flex items-end justify-end">
                <span className="font-mono text-[10px] uppercase tracking-widest text-on-primary/70">Ver relatório →</span>
              </div>
            </div>
          </Link>
        )}

        {/* Freemium — uso do tier grátis */}
        {billingQ.data?.plano === 'gratis' && (
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary font-bold">Plano grátis</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-on-surface-dim">Nível 1</p>
            </div>
            <p className="text-sm text-on-surface mb-3">
              Você usou <span className="qtm-num font-semibold">{usados}</span> de{' '}
              <span className="qtm-num font-semibold">{limite}</span> {unidadeProd}.
            </p>
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-primary rounded-full" style={{ width: `${pctUso}%` }} />
            </div>
            <Link to="/assinatura" className="btn-secondary block text-center">Fazer upgrade</Link>
          </div>
        )}

        {/* Atalhos — ferramentas em cards com ícone */}
        <div>
          <p className="label mb-3">Atalhos</p>
          <div className="grid grid-cols-2 gap-3">
            {ferramentas.map((f) => (
              <Link key={f.to} to={f.to} className="card flex flex-col gap-2 active:bg-surface-1">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-2 text-primary">
                  <svg className="w-5 h-5" {...stroke}>{f.icon}</svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-on-surface leading-tight">{f.label}</p>
                  <p className="text-xs text-on-surface-dim leading-tight mt-0.5">{f.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Últimos produtos */}
        {listaProdutos.length > 0 && (
          <div>
            <p className="label mb-3">Produtos recentes</p>
            <div className="card p-0 overflow-hidden">
              {listaProdutos.slice(0, 5).map((p) => (
                <Link key={p.id} to={`/produtos/${p.id}`} className="flex items-center justify-between border-b border-outline px-5 py-3.5 last:border-b-0 active:bg-surface-1">
                  <span className="text-sm font-medium text-on-surface">{p.nome}</span>
                  <svg className="w-4 h-4 text-on-surface-dim" {...stroke}><path d="M9 5l7 7-7 7" /></svg>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
