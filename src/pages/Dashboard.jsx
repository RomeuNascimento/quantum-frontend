import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { getMe } from '../api/auth'
import { listarProdutos } from '../api/produtos'
import { resumoCustosFixos } from '../api/custosFixos'
import useAuthStore from '../store/authStore'

const atalhos = [
  { to: '/ingredientes/novo', label: 'Ingrediente', cor: 'bg-orange-50 text-orange-600' },
  { to: '/embalagens/novo', label: 'Embalagem', cor: 'bg-blue-50 text-blue-600' },
  { to: '/receitas/novo', label: 'Receita', cor: 'bg-green-50 text-green-600' },
  { to: '/produtos/novo', label: 'Produto', cor: 'bg-purple-50 text-purple-600' },
]

export default function Dashboard() {
  const { user, setUser } = useAuthStore()
  const [produtos, setProdutos] = useState([])
  const [resumo, setResumo] = useState(null)

  useEffect(() => {
    getMe().then((r) => setUser(r.data)).catch(() => {})
    listarProdutos().then((r) => setProdutos(r.data)).catch(() => {})
    resumoCustosFixos().then((r) => setResumo(r.data)).catch(() => {})
  }, [])

  return (
    <Layout title="Quantum">
      <div className="px-4 pt-4 space-y-5">
        {/* Saudação */}
        <div>
          <p className="text-gray-500 text-sm">Bem-vinda,</p>
          <h2 className="text-xl font-bold text-gray-900">{user?.nome || '...'}</h2>
        </div>

        {/* Cards resumo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card">
            <p className="text-xs text-gray-500 mb-1">Produtos cadastrados</p>
            <p className="text-2xl font-bold text-primary-600">{produtos.length}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-500 mb-1">Custos fixos/mês</p>
            <p className="text-2xl font-bold text-primary-600">
              {resumo ? `R$ ${resumo.total_mensal.toFixed(2)}` : '—'}
            </p>
          </div>
        </div>

        {/* Atalhos rápidos */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Cadastrar rapidamente</h3>
          <div className="grid grid-cols-2 gap-3">
            {atalhos.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className={`card flex items-center gap-3 ${a.cor}`}
              >
                <span className="text-sm font-medium">+ {a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Últimos produtos */}
        {produtos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Produtos recentes</h3>
            <div className="space-y-2">
              {produtos.slice(0, 5).map((p) => (
                <Link key={p.id} to={`/produtos/${p.id}`} className="card flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{p.nome}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
