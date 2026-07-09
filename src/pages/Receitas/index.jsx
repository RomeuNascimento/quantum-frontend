import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import LoadError from '../../components/LoadError'
import ConfirmDialog from '../../components/ConfirmDialog'
import { listarReceitas, deletarReceita } from '../../api/receitas'

export default function Receitas() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [erroDelete, setErroDelete] = useState('')
  const [confirmar, setConfirmar] = useState(null) // { id, nome }

  const { data: items = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['receitas'],
    queryFn: () => listarReceitas().then((r) => r.data),
  })

  useEffect(() => { if (error) setErroDelete(error.message) }, [error])

  const remover = useMutation({
    mutationFn: deletarReceita,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['receitas'] }),
    onError: (e) => setErroDelete(e.message),
  })

  const handleDelete = (id, nome) => setConfirmar({ id, nome })

  const confirmarDelete = () => {
    setErroDelete('')
    remover.mutate(confirmar.id)
    setConfirmar(null)
  }

  return (
    <Layout title="Receitas" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4">
        {/* Cabeçalho */}
        <header className="mb-5">
          <p className="eyebrow">CATÁLOGO</p>
          <h1 className="title-serif text-3xl">Receitas</h1>
          <p className="text-sm text-on-surface-dim mt-1">Suas fichas com ingredientes e mão de obra</p>
        </header>

        {erroDelete && (
          <div className="bg-danger-bg text-on-danger-bg border border-danger/30 rounded-xl px-3 py-2 mb-4 flex items-center justify-between gap-2">
            <p className="font-sans text-sm flex-1">{erroDelete}</p>
            <button onClick={() => setErroDelete('')} className="font-mono text-xs">✕</button>
          </div>
        )}

        {isLoading ? <LoadingSpinner /> : isError ? (
          <LoadError onRetry={() => { setErroDelete(''); refetch() }} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Nenhuma receita"
            description="Cadastre suas receitas com ingredientes e mão de obra"
            action={<Link to="/receitas/novo" className="btn-primary inline-block px-4 py-2 text-xs">+ Nova receita</Link>}
          />
        ) : (
          <div className="space-y-3">
            {items.map((r) => (
              <div key={r.id} className="card flex items-center gap-3">
                <Link to={`/receitas/${r.id}`} className="flex-1 min-w-0">
                  {r.tipo && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge bg-info text-on-info">
                        {r.tipo}
                      </span>
                    </div>
                  )}
                  <p className="font-serif font-semibold text-lg text-on-surface truncate">{r.nome}</p>
                  <p className="text-sm text-on-surface-dim mt-0.5">Rendimento: <span className="qtm-num">{r.rendimento_g}</span>g</p>
                </Link>
                <button onClick={() => handleDelete(r.id, r.nome)} aria-label={`Remover ${r.nome}`} className="p-2 text-on-surface-dim active:text-danger flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB secundário — IA Import */}
      <Link to="/receitas/importar" className="fab bottom-[140px] bg-card text-primary border border-outline-strong">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z" />
        </svg>
        IA Import
      </Link>

      {/* FAB principal — Nova receita */}
      <Link to="/receitas/novo" className="fab">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Nova
      </Link>

      <ConfirmDialog
        isOpen={confirmar != null}
        onClose={() => setConfirmar(null)}
        onConfirm={confirmarDelete}
        title="Remover receita"
        message={`Remover "${confirmar?.nome}"? Esta ação não pode ser desfeita.`}
      />
    </Layout>
  )
}
