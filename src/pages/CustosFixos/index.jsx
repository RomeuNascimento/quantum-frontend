import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import FormField from '../../components/FormField'
import LoadingSpinner from '../../components/LoadingSpinner'
import LoadError from '../../components/LoadError'
import { listarCustosFixos, criarCustoFixo, atualizarCustoFixo, deletarCustoFixo, resumoCustosFixos } from '../../api/custosFixos'
import { useForm } from 'react-hook-form'

import { brl } from '../../utils/format'

export default function CustosFixos() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [confirmar, setConfirmar] = useState(null) // { id, nome }
  const [erro, setErro] = useState('')

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const itensQ = useQuery({
    queryKey: ['custos-fixos'],
    queryFn: () => listarCustosFixos().then((r) => r.data),
  })
  const resumoQ = useQuery({
    queryKey: ['custos-fixos-resumo'],
    queryFn: () => resumoCustosFixos().then((r) => r.data),
  })
  const items = itensQ.data ?? []
  const resumo = resumoQ.data ?? null
  const loading = itensQ.isLoading || resumoQ.isLoading

  useEffect(() => {
    const e = itensQ.error || resumoQ.error
    if (e) setErro(e.message)
  }, [itensQ.error, resumoQ.error])

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['custos-fixos'] })
    queryClient.invalidateQueries({ queryKey: ['custos-fixos-resumo'] })
  }

  const abrirNovo = () => {
    setEditItem(null)
    reset()
    setShowModal(true)
  }

  const abrirEditar = (item) => {
    setEditItem(item)
    setValue('nome', item.nome)
    setValue('valor', item.valor)
    setValue('periodo', item.periodo)
    setShowModal(true)
  }

  const salvar = useMutation({
    mutationFn: ({ id, payload }) => (id ? atualizarCustoFixo(id, payload) : criarCustoFixo(payload)),
    onSuccess: invalidar,
    onError: (e) => setErro(e.message),
    onSettled: () => {
      setShowModal(false)
      setEditItem(null)
    },
  })

  const onSubmit = (dados) =>
    salvar.mutate({ id: editItem?.id, payload: { ...dados, valor: parseFloat(dados.valor) } })

  const remover = useMutation({
    mutationFn: deletarCustoFixo,
    onSuccess: invalidar,
    onError: (e) => setErro(e.message),
  })

  const handleDelete = (id, nome) => setConfirmar({ id, nome })

  const confirmarDelete = () => {
    setErro('')
    remover.mutate(confirmar.id)
    setConfirmar(null)
  }

  return (
    <Layout title="Custos Fixos" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4">
        {/* Cabeçalho */}
        <header className="mb-5">
          <p className="eyebrow">GESTÃO</p>
          <h1 className="title-serif text-3xl">Custos fixos</h1>
          <p className="text-sm text-on-surface-dim mt-1">Aluguel, luz, internet — as contas do mês</p>
        </header>

        {erro && (
          <div className="bg-danger-bg text-on-danger-bg border border-danger/30 rounded-xl px-3 py-2 mb-4 flex items-center justify-between gap-2">
            <p className="font-sans text-sm flex-1">{erro}</p>
            <button onClick={() => setErro('')} className="font-mono text-xs">✕</button>
          </div>
        )}
        {/* Resumo */}
        {resumo && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="card">
              <p className="label">Total mensal</p>
              <p className="qtm-num text-2xl font-bold text-primary">{brl(resumo.total_mensal)}</p>
            </div>
            <div className="card">
              <p className="label">Total anual</p>
              <p className="qtm-num text-2xl font-bold text-secondary">{brl(resumo.total_anual)}</p>
            </div>
          </div>
        )}

        {loading ? <LoadingSpinner /> : itensQ.isError ? (
          <LoadError onRetry={() => { setErro(''); itensQ.refetch(); resumoQ.refetch() }} />
        ) : (
          <div className="space-y-3">
            {items.map((cf) => (
              <div key={cf.id} className="card flex items-center justify-between gap-3">
                <button onClick={() => abrirEditar(cf)} className="flex-1 text-left min-w-0">
                  <p className="font-serif font-semibold text-lg text-on-surface truncate">{cf.nome}</p>
                  <p className="text-sm text-on-surface-dim mt-0.5">
                    <span className="qtm-num">{brl(cf.valor)}</span> / {cf.periodo === 'mensal' ? 'mês' : 'ano'} →{' '}
                    <span className="qtm-num font-semibold text-on-surface">{brl(cf.valor_mensal)}/mês</span>
                  </p>
                </button>
                <button onClick={() => handleDelete(cf.id, cf.nome)} aria-label={`Remover ${cf.nome}`} className="p-2 text-on-surface-dim active:text-danger flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {items.length === 0 && (
              <p className="font-sans text-sm text-on-surface-dim text-center py-8">
                Nenhum custo fixo cadastrado
              </p>
            )}
          </div>
        )}
      </div>

      {/* FAB fixo acima da bottom nav */}
      <button onClick={abrirNovo} className="fab">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Novo
      </button>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null) }}
        title={editItem ? 'Editar custo fixo' : 'Novo custo fixo'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <FormField label="Nome" error={errors.nome?.message}>
            <input className="input" placeholder="Ex: Aluguel, Internet, Luz..."
              {...register('nome', { required: 'Obrigatório' })} />
          </FormField>
          <FormField label="Valor (R$)" error={errors.valor?.message}>
            <input className="input" type="number" step="0.01"
              {...register('valor', { required: 'Obrigatório' })} />
          </FormField>
          <FormField label="Período">
            <select className="input" {...register('periodo', { required: true })}>
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
            </select>
          </FormField>
          <button type="submit" className="btn-primary">Salvar</button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmar != null}
        onClose={() => setConfirmar(null)}
        onConfirm={confirmarDelete}
        title="Remover custo fixo"
        message={`Remover "${confirmar?.nome}"? Esta ação não pode ser desfeita.`}
      />
    </Layout>
  )
}
