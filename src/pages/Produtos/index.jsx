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
        {erroDelete && (
          <div className="bg-rust/10 border border-rust px-3 py-2 mb-4 flex items-center justify-between gap-2">
            <p className="font-mono text-xs text-rust flex-1">{erroDelete}</p>
            <button onClick={() => setErroDelete('')} className="font-mono text-xs text-rust">✕</button>
          </div>
        )}

        {isLoading ? <LoadingSpinner /> : isError ? (
          <LoadError onRetry={() => { setErroDelete(''); refetch() }} />
        ) : items.length === 0 ? (
          <EmptyState title="Nenhum produto" description="Monte seus produtos combinando receitas e ingredientes"
            action={<Link to="/produtos/novo" className="btn-primary w-auto px-6">Cadastrar</Link>} />
        ) : (
          <div>
            {items.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
                <Link to={`/produtos/${p.id}`} className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{p.nome}</p>
                  <p className="font-mono text-xs text-mute">Ver custo e precificação →</p>
                </Link>
                <button onClick={() => handleDelete(p.id, p.nome)} className="p-2 text-mute active:text-rust">
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

      {/* FAB fixo acima da bottom nav */}
      <Link
        to="/produtos/novo"
        className="fixed bottom-[88px] right-4 sm:right-[max(1rem,calc(50%-17rem))] z-30 bg-lime text-ink font-mono font-bold text-xs uppercase tracking-widest px-4 py-3 border border-ink/20 active:bg-lime-dim"
      >
        + Novo
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
