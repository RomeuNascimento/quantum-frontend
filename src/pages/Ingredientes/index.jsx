import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import LoadError from '../../components/LoadError'
import ConfirmDialog from '../../components/ConfirmDialog'
import { listarIngredientes, deletarIngrediente } from '../../api/ingredientes'
import { brl4 } from '../../utils/format'

const formatCusto = (v) => (v != null ? brl4(v) : '—')

export default function Ingredientes() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [erroDelete, setErroDelete] = useState('')
  const [confirmar, setConfirmar] = useState(null) // { id, nome }

  const { data: items = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['ingredientes'],
    queryFn: () => listarIngredientes().then((r) => r.data),
  })

  // Erro de carregamento usa o mesmo banner (dismissável) das deleções
  useEffect(() => { if (error) setErroDelete(error.message) }, [error])

  const remover = useMutation({
    mutationFn: deletarIngrediente,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredientes'] }),
    onError: (e) => setErroDelete(e.message),
  })

  const handleDelete = (id, nome) => setConfirmar({ id, nome })

  const confirmarDelete = () => {
    setErroDelete('')
    remover.mutate(confirmar.id)
    setConfirmar(null)
  }

  return (
    <Layout title="Ingredientes" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4">

        {/* Cabeçalho */}
        <header className="mb-5">
          <p className="eyebrow">CATÁLOGO</p>
          <h1 className="title-serif text-3xl">Ingredientes</h1>
          <p className="text-sm text-on-surface-dim mt-1">Seus insumos e o custo de cada um</p>
        </header>

        {/* Importar nota fiscal via IA */}
        <Link
          to="/ingredientes/importar-nota"
          className="flex items-center gap-3 bg-primary text-on-primary rounded-xl px-4 py-4 mb-3 active:brightness-125 transition-all"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
          </svg>
          <div className="flex-1">
            <p className="font-serif font-semibold text-base">Importar nota fiscal</p>
            <p className="text-xs text-on-primary/70 mt-0.5">IA extrai os ingredientes automaticamente</p>
          </div>
          <svg className="w-4 h-4 flex-shrink-0 text-on-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {erroDelete && (
          <div className="bg-danger-bg text-on-danger-bg border border-danger/30 rounded-xl px-3 py-2 mb-4 flex items-center justify-between gap-2">
            <p className="font-sans text-sm flex-1">{erroDelete}</p>
            <button onClick={() => setErroDelete('')} className="font-mono text-xs">✕</button>
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <LoadError onRetry={() => { setErroDelete(''); refetch() }} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Nenhum ingrediente"
            description="Cadastre seus ingredientes para calcular custos"
          />
        ) : (
          <div className="space-y-3">
            {items.map((ing) => (
              <div key={ing.id} className="card flex items-center justify-between gap-3">
                <Link to={`/ingredientes/${ing.id}`} className="flex-1 min-w-0">
                  <p className="font-serif font-semibold text-lg text-on-surface truncate">
                    {ing.nome}{ing.marca ? <span className="text-on-surface-dim font-sans font-normal text-sm"> · {ing.marca}</span> : null}
                  </p>
                  <p className="text-sm text-on-surface-dim mt-0.5">
                    <span className="qtm-num">{ing.unidade}</span> · fator <span className="qtm-num">{ing.fator_correcao}</span> · <span className="qtm-num">{formatCusto(ing.custo_unitario_atual)}</span>/un
                  </p>
                </Link>
                <button
                  onClick={() => handleDelete(ing.id, ing.nome)}
                  aria-label={`Remover ${ing.nome}`}
                  className="p-2 text-on-surface-dim active:text-danger flex-shrink-0"
                >
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
      <Link to="/ingredientes/novo" className="fab">
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
        title="Remover ingrediente"
        message={`Remover "${confirmar?.nome}"? Esta ação não pode ser desfeita.`}
      />
    </Layout>
  )
}
