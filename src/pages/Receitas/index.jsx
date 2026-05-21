import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { listarReceitas, deletarReceita } from '../../api/receitas'

export default function Receitas() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [erroDelete, setErroDelete] = useState('')

  const carregar = () =>
    listarReceitas().then((r) => setItems(r.data)).finally(() => setLoading(false))

  useEffect(() => { carregar() }, [])

  const handleDelete = async (id, nome) => {
    if (!confirm(`Remover "${nome}"?`)) return
    setErroDelete('')
    try {
      await deletarReceita(id)
      carregar()
    } catch (e) {
      setErroDelete(e.message)
    }
  }

  return (
    <Layout title="Receitas" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4">

        {/* Importar receitas via IA */}
        <Link
          to="/receitas/importar"
          className="flex items-center gap-3 bg-ink text-bone border border-ink px-4 py-3 mb-3 active:opacity-80"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <div className="flex-1">
            <p className="font-mono text-xs uppercase tracking-widest">Importar receitas via IA</p>
            <p className="font-mono text-[10px] text-bone/60 mt-0.5">Foto, PDF ou planilha — IA extrai automaticamente</p>
          </div>
          <svg className="w-4 h-4 flex-shrink-0 text-bone/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* + Nova receita */}
        <Link
          to="/receitas/novo"
          className="flex items-center justify-center gap-2 btn-primary w-full py-3 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nova Receita
        </Link>

        {erroDelete && (
          <div className="bg-rust/10 border border-rust px-3 py-2 mb-4 flex items-center justify-between gap-2">
            <p className="font-mono text-xs text-rust flex-1">{erroDelete}</p>
            <button onClick={() => setErroDelete('')} className="font-mono text-xs text-rust">✕</button>
          </div>
        )}

        {loading ? <LoadingSpinner /> : items.length === 0 ? (
          <EmptyState
            title="Nenhuma receita"
            description="Cadastre suas receitas com ingredientes e mão de obra"
          />
        ) : (
          <div>
            {items.map((r) => (
              <div key={r.id} className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
                <Link to={`/receitas/${r.id}`} className="flex-1 min-w-0">
                  {r.tipo && (
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-mute border border-line px-1.5 py-0.5">
                        {r.tipo}
                      </span>
                    </div>
                  )}
                  <p className="font-medium text-ink truncate">{r.nome}</p>
                  <p className="font-mono text-xs text-mute">Rendimento: {r.rendimento_g}g</p>
                </Link>
                <button onClick={() => handleDelete(r.id, r.nome)} className="p-2 text-mute active:text-rust">
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
