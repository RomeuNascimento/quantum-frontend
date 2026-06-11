import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { getMe } from '../api/auth'
import { listarProdutos } from '../api/produtos'
import { resumoCustosFixos } from '../api/custosFixos'
import { relatorioMargem } from '../api/precificacao'
import useAuthStore from '../store/authStore'

const atalhos = [
  { to: '/ingredientes/novo', label: 'Ingrediente' },
  { to: '/embalagens/novo', label: 'Embalagem' },
  { to: '/receitas/novo', label: 'Receita' },
  { to: '/produtos/novo', label: 'Produto' },
]

export default function Dashboard() {
  const { user, setUser } = useAuthStore()
  const [produtos, setProdutos] = useState([])
  const [resumo, setResumo] = useState(null)
  const [margemAlerta, setMargemAlerta] = useState([])

  useEffect(() => {
    getMe().then((r) => setUser(r.data)).catch(() => {})
    listarProdutos().then((r) => setProdutos(r.data)).catch(() => {})
    resumoCustosFixos().then((r) => setResumo(r.data)).catch(() => {})
    relatorioMargem().then((r) => {
      const corroidos = r.data.produtos.filter((p) =>
        p.canais.some((c) => c.margem_real_pct < 10)
      )
      setMargemAlerta(corroidos)
    }).catch(() => {})
  }, [])

  const totalMensal = resumo?.total_mensal ?? 0

  return (
    <Layout title="Quantum">
      <div className="px-4 pt-4 space-y-5">
        {/* Saudação */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-mute">Bem-vinda</p>
          <h2 className="text-xl font-bold text-ink font-sans">{user?.nome || '...'}</h2>
        </div>

        {/* Alerta de margem corroída */}
        {margemAlerta.length > 0 && (
          <Link to="/relatorio" className="flex items-center gap-3 bg-rust text-bone border border-rust px-4 py-3 active:opacity-80">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="font-mono text-xs font-bold uppercase tracking-widest">
                {margemAlerta.length === 1
                  ? '1 produto precisa de reajuste'
                  : `${margemAlerta.length} produtos precisam de reajuste`}
              </p>
              <p className="font-mono text-[10px] text-bone/80 truncate">
                Margem abaixo de 10%: {margemAlerta.map((p) => p.produto_nome).join(', ')}
              </p>
            </div>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        {/* Cards resumo */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/produtos" className="card active:bg-line/50">
            <p className="label">Produtos</p>
            <p className="qtm-num text-2xl font-bold text-ink">{produtos.length}</p>
          </Link>
          <Link to="/custos-fixos" className="card active:bg-line/50">
            <p className="label">Custos/mês</p>
            <p className={`qtm-num text-2xl font-bold ${totalMensal > 0 ? 'text-rust' : 'text-ink'}`}>
              R$ {totalMensal.toFixed(2)}
            </p>
          </Link>
        </div>

        {/* Atalhos rápidos */}
        <div>
          <p className="label mb-3">Cadastrar</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {atalhos.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="border border-ink bg-bone flex items-center gap-2 px-3 py-3 active:bg-ink active:text-bone transition-colors"
              >
                <span className="font-mono text-xs uppercase tracking-widest text-ink">+ {a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Gerenciar */}
        <div>
          <p className="label mb-3">Gerenciar</p>
          <div>
            {[
              { to: '/relatorio', label: 'Relatório de margem' },
              { to: '/embalagens', label: 'Embalagens' },
              { to: '/custos-fixos', label: 'Custos fixos' },
            ].map((g) => (
              <Link
                key={g.to}
                to={g.to}
                className="flex items-center justify-between border-b border-line py-3 last:border-b-0"
              >
                <span className="text-sm font-medium text-ink">{g.label}</span>
                <svg className="w-4 h-4 text-mute" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Últimos produtos */}
        {produtos.length > 0 && (
          <div>
            <p className="label mb-3">Produtos recentes</p>
            <div>
              {produtos.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  to={`/produtos/${p.id}`}
                  className="flex items-center justify-between border-b border-line py-3 last:border-b-0"
                >
                  <span className="text-sm font-medium text-ink">{p.nome}</span>
                  <svg className="w-4 h-4 text-mute" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
