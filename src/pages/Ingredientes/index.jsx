import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { listarIngredientes, deletarIngrediente } from '../../api/ingredientes'

const formatCusto = (v) => (v != null ? `R$ ${v.toFixed(4)}` : '—')

export default function Ingredientes() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const carregar = () =>
    listarIngredientes()
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false))

  useEffect(() => { carregar() }, [])

  const handleDelete = async (id, nome) => {
    if (!confirm(`Remover "${nome}"?`)) return
    await deletarIngrediente(id)
    carregar()
  }

  return (
    <Layout title="Ingredientes">
      <div className="px-4 pt-4">
        <div className="flex justify-end mb-4">
          <Link
            to="/ingredientes/novo"
            className="bg-lime text-ink font-mono font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-none active:bg-lime-dim"
          >
            + Novo
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            title="Nenhum ingrediente"
            description="Cadastre seus ingredientes para calcular custos"
            action={<Link to="/ingredientes/novo" className="btn-primary w-auto px-6">Cadastrar</Link>}
          />
        ) : (
          <div>
            {items.map((ing) => (
              <div key={ing.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
                <Link to={`/ingredientes/${ing.id}`} className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{ing.nome}</p>
                  <p className="font-mono text-xs text-mute mt-0.5">
                    {ing.unidade} · fator {ing.fator_correcao} · {formatCusto(ing.custo_unitario_atual)}/un
                  </p>
                </Link>
                <button
                  onClick={() => handleDelete(ing.id, ing.nome)}
                  className="p-2 text-mute active:text-rust flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
