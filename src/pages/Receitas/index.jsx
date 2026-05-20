import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { listarReceitas, deletarReceita } from '../../api/receitas'

const tipoLabel = { massa: 'Massa', recheio: 'Recheio' }
const tipoColor = { massa: 'bg-amber-100 text-amber-700', recheio: 'bg-pink-100 text-pink-700' }

export default function Receitas() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const carregar = () =>
    listarReceitas().then((r) => setItems(r.data)).finally(() => setLoading(false))

  useEffect(() => { carregar() }, [])

  const handleDelete = async (id, nome) => {
    if (!confirm(`Remover "${nome}"?`)) return
    await deletarReceita(id)
    carregar()
  }

  return (
    <Layout title="Receitas">
      <div className="px-4 pt-4">
        <div className="flex justify-end mb-4">
          <Link to="/receitas/novo" className="bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-xl">
            + Nova
          </Link>
        </div>
        {loading ? <LoadingSpinner /> : items.length === 0 ? (
          <EmptyState title="Nenhuma receita" description="Cadastre suas receitas com ingredientes e mão de obra"
            action={<Link to="/receitas/novo" className="btn-primary w-auto px-6">Cadastrar</Link>} />
        ) : (
          <div className="space-y-2">
            {items.map((r) => (
              <div key={r.id} className="card flex items-center gap-3">
                <Link to={`/receitas/${r.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tipoColor[r.tipo]}`}>
                      {tipoLabel[r.tipo]}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 truncate">{r.nome}</p>
                  <p className="text-xs text-gray-500">Rendimento: {r.rendimento_g}g</p>
                </Link>
                <button onClick={() => handleDelete(r.id, r.nome)} className="p-2 text-gray-400 active:text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
