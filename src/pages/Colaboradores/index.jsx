import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import LoadError from '../../components/LoadError'
import ConfirmDialog from '../../components/ConfirmDialog'
import { listarColaboradores, deletarColaborador } from '../../api/colaboradores'
import { brl } from '../../utils/format'

export default function Colaboradores() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [erroDelete, setErroDelete] = useState('')
  const [confirmar, setConfirmar] = useState(null) // { id, nome }

  const { data: items = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: () => listarColaboradores().then((r) => r.data),
  })

  useEffect(() => { if (error) setErroDelete(error.message) }, [error])

  const remover = useMutation({
    mutationFn: deletarColaborador,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] })
      // Some do cálculo das etapas que o usavam → recalcula custos de MO
      ;['receitas', 'produtos', 'relatorio-margem', 'precos-produto', 'receita', 'produto']
        .forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }))
    },
    onError: (e) => setErroDelete(e.message),
  })

  const confirmarDelete = () => {
    setErroDelete('')
    remover.mutate(confirmar.id)
    setConfirmar(null)
  }

  return (
    <Layout title="Colaboradores" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4">
        <Link
          to="/colaboradores/novo"
          className="flex items-center justify-center gap-2 btn-primary w-full py-3 mb-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo colaborador
        </Link>

        <p className="text-xs text-mute mb-4">
          Quem produz junto com você. O salário vira custo por hora nas etapas de mão de obra
          das receitas e produtos. Sem colaborador, tudo usa o valor-hora padrão das Configurações.
        </p>

        {erroDelete && (
          <div className="bg-rust/10 border border-rust px-3 py-2 mb-4 flex items-center justify-between gap-2">
            <p className="font-sans text-sm text-rust flex-1">{erroDelete}</p>
            <button onClick={() => setErroDelete('')} className="font-mono text-xs text-rust">✕</button>
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <LoadError onRetry={() => { setErroDelete(''); refetch() }} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Nenhum colaborador"
            description="Cadastre quem produz com você para usar o valor-hora de cada um"
          />
        ) : (
          <div>
            {items.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
                <Link to={`/colaboradores/${c.id}`} className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{c.nome}</p>
                  <p className="qtm-num text-xs text-mute mt-0.5">{brl(c.valor_hora)}/hora</p>
                </Link>
                <button
                  onClick={() => setConfirmar({ id: c.id, nome: c.nome })}
                  aria-label={`Remover ${c.nome}`}
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

      <ConfirmDialog
        isOpen={confirmar != null}
        onClose={() => setConfirmar(null)}
        onConfirm={confirmarDelete}
        title="Remover colaborador"
        message={`Remover "${confirmar?.nome}"? As etapas que usavam este colaborador passam a usar o valor-hora padrão.`}
      />
    </Layout>
  )
}
