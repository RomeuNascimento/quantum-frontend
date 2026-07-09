import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import LoadError from '../../components/LoadError'
import ConfirmDialog from '../../components/ConfirmDialog'
import { listarProdutos, deletarProduto } from '../../api/produtos'

export default function Produtos() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [erroDelete, setErroDelete] = useState('')
  const [confirmar, setConfirmar] = useState(null) // { id, nome }

  const { data: items = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => listarProdutos().then((r) => r.data),
  })

  useEffect(() => { if (error) setErroDelete(error.message) }, [error])

  const remover = useMutation({
    mutationFn: deletarProduto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      queryClient.invalidateQueries({ queryKey: ['relatorio-margem'] })
    },
    onError: (e) => setErroDelete(e.message),
  })

  const handleDelete = (id, nome) => setConfirmar({ id, nome })

  const confirmarDelete = () => {
    setErroDelete('')
    remover.mutate(confirmar.id)
    setConfirmar(null)
  }

  return (
    <Layout title="Produtos" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4">
        {/* Cabeçalho */}
        <header className="mb-5">
          <p className="eyebrow">CATÁLOGO</p>
          <h1 className="title-serif text-3xl">Produtos</h1>
          <p className="text-sm text-on-surface-dim mt-1">O que você vende — com custo e preço</p>
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
          <EmptyState title="Nenhum produto" description="Monte seus produtos combinando receitas e ingredientes"
            action={<Link to="/produtos/novo" className="btn-primary w-auto px-6">Cadastrar</Link>} />
        ) : (
          <div className="space-y-3">
            {items.map((p) => (
              <div key={p.id} className="card flex items-center justify-between gap-3">
                <Link to={`/produtos/${p.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2 border border-outline flex items-center justify-center">
                    {p.foto ? (
                      <img src={p.foto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-on-surface-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif font-semibold text-lg text-on-surface truncate">{p.nome}</p>
                    <p className="text-sm text-secondary mt-0.5">Ver custo e preço →</p>
                  </div>
                </Link>
                <button onClick={() => handleDelete(p.id, p.nome)} aria-label={`Remover ${p.nome}`} className="p-2 text-on-surface-dim active:text-danger flex-shrink-0">
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

      {/* FAB fixo acima da bottom nav */}
      <Link to="/produtos/novo" className="fab">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Novo
      </Link>

      <ConfirmDialog
        isOpen={confirmar != null}
        onClose={() => setConfirmar(null)}
        onConfirm={confirmarDelete}
        title="Remover produto"
        message={`Remover "${confirmar?.nome}"? Esta ação não pode ser desfeita.`}
      />
    </Layout>
  )
}
