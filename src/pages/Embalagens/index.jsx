import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import LoadError from '../../components/LoadError'
import ConfirmDialog from '../../components/ConfirmDialog'
import { listarEmbalagens, deletarEmbalagem } from '../../api/embalagens'
import { brl4 } from '../../utils/format'

export default function Embalagens() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [erroDelete, setErroDelete] = useState('')
  const [confirmar, setConfirmar] = useState(null) // { id, nome }

  const { data: items = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['embalagens'],
    queryFn: () => listarEmbalagens().then((r) => r.data),
  })

  useEffect(() => { if (error) setErroDelete(error.message) }, [error])

  const remover = useMutation({
    mutationFn: deletarEmbalagem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['embalagens'] }),
    onError: (e) => setErroDelete(e.message),
  })

  const handleDelete = (id, nome) => setConfirmar({ id, nome })

  const confirmarDelete = () => {
    setErroDelete('')
    remover.mutate(confirmar.id)
    setConfirmar(null)
  }

  return (
    <Layout title="Embalagens" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4">
        {/* Cabeçalho */}
        <header className="mb-5">
          <p className="eyebrow">CATÁLOGO</p>
          <h1 className="title-serif text-3xl">Embalagens</h1>
          <p className="text-sm text-on-surface-dim mt-1">Caixas, potes e sacos que embalam seus produtos</p>
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
          <EmptyState title="Nenhuma embalagem" description="Cadastre suas embalagens"
            action={<Link to="/embalagens/novo" className="btn-primary w-auto px-6">Cadastrar</Link>} />
        ) : (
          <div className="space-y-3">
            {items.map((e) => (
              <div key={e.id} className="card flex items-center justify-between gap-3">
                <Link to={`/embalagens/${e.id}`} className="flex-1 min-w-0">
                  <p className="font-serif font-semibold text-lg text-on-surface truncate">{e.nome}</p>
                  <p className="text-sm text-on-surface-dim mt-0.5">
                    <span className="qtm-num">{e.unidade}</span> · {e.custo_unitario_atual != null ? <><span className="qtm-num">{brl4(e.custo_unitario_atual)}</span>/un</> : 'sem preço'}
                  </p>
                </Link>
                <button onClick={() => handleDelete(e.id, e.nome)} aria-label={`Remover ${e.nome}`} className="p-2 text-on-surface-dim active:text-danger flex-shrink-0">
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
      <Link to="/embalagens/novo" className="fab">
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
        title="Remover embalagem"
        message={`Remover "${confirmar?.nome}"? Esta ação não pode ser desfeita.`}
      />
    </Layout>
  )
}
