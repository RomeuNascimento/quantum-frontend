import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import Modal from '../../components/Modal'
import FormField from '../../components/FormField'
import LoadingSpinner from '../../components/LoadingSpinner'
import { listarCustosFixos, criarCustoFixo, atualizarCustoFixo, deletarCustoFixo, resumoCustosFixos } from '../../api/custosFixos'
import { useForm } from 'react-hook-form'

const brl = (v) => `R$ ${Number(v || 0).toFixed(2)}`

export default function CustosFixos() {
  const [items, setItems] = useState([])
  const [resumo, setResumo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const carregar = async () => {
    const [c, r] = await Promise.all([listarCustosFixos(), resumoCustosFixos()])
    setItems(c.data)
    setResumo(r.data)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

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

  const onSubmit = async (dados) => {
    const payload = { ...dados, valor: parseFloat(dados.valor) }
    if (editItem) await atualizarCustoFixo(editItem.id, payload)
    else await criarCustoFixo(payload)
    setShowModal(false)
    setEditItem(null)
    carregar()
  }

  const handleDelete = async (id, nome) => {
    if (!confirm(`Remover "${nome}"?`)) return
    await deletarCustoFixo(id)
    carregar()
  }

  return (
    <Layout title="Custos Fixos">
      <div className="px-4 pt-4">
        {/* Resumo */}
        {resumo && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="card">
              <p className="label">Total mensal</p>
              <p className="qtm-num text-xl font-bold text-ink">{brl(resumo.total_mensal)}</p>
            </div>
            <div className="card">
              <p className="label">Total anual</p>
              <p className="qtm-num text-xl font-bold text-mute">{brl(resumo.total_anual)}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end mb-4">
          <button
            onClick={abrirNovo}
            className="bg-lime text-ink font-mono font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-none active:bg-lime-dim"
          >
            + Novo
          </button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div>
            {items.map((cf) => (
              <div key={cf.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
                <button onClick={() => abrirEditar(cf)} className="flex-1 text-left min-w-0">
                  <p className="font-medium text-ink truncate">{cf.nome}</p>
                  <p className="font-mono text-xs text-mute">
                    {brl(cf.valor)} / {cf.periodo === 'mensal' ? 'mês' : 'ano'} →{' '}
                    <span className="font-bold text-ink">{brl(cf.valor_mensal)}/mês</span>
                  </p>
                </button>
                <button onClick={() => handleDelete(cf.id, cf.nome)} className="p-2 text-mute active:text-rust flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {items.length === 0 && (
              <p className="font-mono text-xs text-mute text-center py-8 uppercase tracking-widest">
                Nenhum custo fixo cadastrado
              </p>
            )}
          </div>
        )}
      </div>

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
    </Layout>
  )
}
