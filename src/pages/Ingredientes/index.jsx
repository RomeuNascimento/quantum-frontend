import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { listarIngredientes, deletarIngrediente } from '../../api/ingredientes'

const formatCusto = (v) => (v != null ? `R$ ${v.toFixed(4)}` : '—')

export default function Ingredientes() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [erroDelete, setErroDelete] = useState('')

  const carregar = () =>
    listarIngredientes()
      .then((r) => setItems(r.data))
      .catch((e) => setErroDelete(e.message))
      .finally(() => setLoading(false))

  useEffect(() => { carregar() }, [])

  const handleDelete = async (id, nome) => {
    if (!confirm(`Remover "${nome}"?`)) return
    setErroDelete('')
    try {
      await deletarIngrediente(id)
      carregar()
    } catch (e) {
      setErroDelete(e.message)
    }
  }

  return (
    <Layout title="Ingredientes" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4">

        {/* Importar nota fiscal via IA */}
        <Link
          to="/ingredientes/importar-nota"
          className="flex items-center gap-3 bg-ink text-bone border border-ink px-4 py-3 mb-3 active:opacity-80"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
            <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
          </svg>
          <div className="flex-1">
            <p className="font-mono text-xs uppercase tracking-widest">Importar nota fiscal</p>
            <p className="font-mono text-[10px] text-bone/60 mt-0.5">IA extrai os ingredientes automaticamente</p>
          </div>
          <svg className="w-4 h-4 flex-shrink-0 text-bone/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* + Novo ingrediente */}
        <Link
          to="/ingredientes/novo"
          className="flex items-center justify-center gap-2 btn-primary w-full py-3 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo Ingrediente
        </Link>

        {erroDelete && (
          <div className="bg-rust/10 border border-rust px-3 py-2 mb-4 flex items-center justify-between gap-2">
            <p className="font-mono text-xs text-rust flex-1">{erroDelete}</p>
            <button onClick={() => setErroDelete('')} className="font-mono text-xs text-rust">✕</button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            title="Nenhum ingrediente"
            description="Cadastre seus ingredientes para calcular custos"
          />
        ) : (
          <div>
            {items.map((ing) => (
              <div key={ing.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
                <Link to={`/ingredientes/${ing.id}`} className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">
                    {ing.nome}{ing.marca ? <span className="text-mute font-normal"> · {ing.marca}</span> : null}
                  </p>
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
