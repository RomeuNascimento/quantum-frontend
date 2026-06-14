import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import Layout from '../../components/Layout'
import FormField from '../../components/FormField'
import useVoltar from '../../hooks/useVoltar'
import { criarReceita, detalharReceita, atualizarReceita } from '../../api/receitas'
import { listarIngredientes } from '../../api/ingredientes'

export default function ReceitaForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const voltar = useVoltar('/receitas')
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    defaultValues: { ingredientes: [], etapas_mo: [] },
  })
  const ingsWatch = watch('ingredientes')
  const { fields: ingFields, append: appendIng, remove: removeIng } = useFieldArray({ control, name: 'ingredientes' })
  const { fields: moFields, append: appendMo, remove: removeMo } = useFieldArray({ control, name: 'etapas_mo' })

  const { data: ingredientes = [] } = useQuery({
    queryKey: ['ingredientes'],
    queryFn: () => listarIngredientes().then((r) => r.data),
  })

  const detalheQ = useQuery({
    queryKey: ['receita', id],
    enabled: isEdit,
    queryFn: () => detalharReceita(id).then((r) => r.data),
  })

  // Preenche o form só na primeira chegada dos dados — refetch posterior
  // não pode sobrescrever edições do usuário
  const formPreenchido = useRef(false)
  useEffect(() => { formPreenchido.current = false }, [id])
  useEffect(() => {
    const d = detalheQ.data
    if (d && !formPreenchido.current) {
      reset({
        nome: d.nome,
        tipo: d.tipo,
        rendimento_g: d.rendimento_g,
        ingredientes: d.ingredientes.map((i) => ({
          ingrediente_id: i.ingrediente_id,
          quantidade_g: i.quantidade_g,
        })),
        etapas_mo: d.etapas_mo.map((e) => ({
          descricao: e.descricao,
          tempo_min: e.tempo_min,
          colaborador_id: e.colaborador_id ?? null,
        })),
      })
      formPreenchido.current = true
    }
  }, [detalheQ.data, reset])

  const onSubmit = async (dados) => {
    setErro('')
    setLoading(true)
    try {
      const payload = {
        nome: dados.nome,
        tipo: dados.tipo || null,
        rendimento_g: parseFloat(dados.rendimento_g),
        ingredientes: dados.ingredientes.map((i) => ({
          ingrediente_id: parseInt(i.ingrediente_id),
          quantidade_g: parseFloat(i.quantidade_g),
        })),
        etapas_mo: dados.etapas_mo.map((e) => ({
          descricao: e.descricao,
          tempo_min: parseFloat(e.tempo_min),
          colaborador_id: e.colaborador_id ?? null,
        })),
      }
      if (isEdit) {
        await atualizarReceita(id, payload)
      } else {
        await criarReceita(payload)
      }
      queryClient.invalidateQueries({ queryKey: ['receitas'] })
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['receita', id] })
        // Receita alterada muda custo dos produtos que a usam
        queryClient.invalidateQueries({ queryKey: ['precos-produto'] })
        queryClient.invalidateQueries({ queryKey: ['relatorio-margem'] })
      }
      voltar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title={isEdit ? 'Editar receita' : 'Nova receita'} onBack={voltar}>
      <form onSubmit={handleSubmit(onSubmit)} className="px-4 pt-4 pb-24 space-y-4">
        {isEdit && (
          <button type="button" onClick={() => navigate(`/receitas/${id}/ficha`)}
            className="w-full flex items-center justify-between bg-ink text-bone border border-ink px-4 py-3 active:opacity-80">
            <span className="font-mono text-xs uppercase tracking-widest">Ficha técnica (PDF)</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <FormField label="Nome da receita" error={errors.nome?.message}>
          <input className="input" {...register('nome', { required: 'Obrigatório' })} />
        </FormField>

        <FormField label="Tipo / Categoria (opcional)">
          <input className="input" placeholder="ex: Base, Recheio, Guarnição, Proteína…"
            {...register('tipo')} />
        </FormField>

        <FormField label="Rendimento (g)" error={errors.rendimento_g?.message}>
          <input className="input" type="number" step="0.1"
            {...register('rendimento_g', {
              required: 'Obrigatório',
              validate: (v) => parseFloat(v) > 0 || 'Deve ser maior que zero',
            })} />
        </FormField>

        {/* Ingredientes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="label">Ingredientes</p>
            <button type="button" onClick={() => appendIng({ ingrediente_id: '', quantidade_g: '' })}
              className="font-mono text-xs uppercase tracking-widest text-ink border border-ink px-3 py-1">
              + Adicionar
            </button>
          </div>
          <div className="space-y-2">
            {ingFields.map((field, idx) => {
              const selId = ingsWatch?.[idx]?.ingrediente_id
              const unidadeSel = ingredientes.find((i) => String(i.id) === String(selId))?.unidade || ''
              return (
              <div key={field.id} className="flex gap-2 items-start">
                <select className="input flex-1" {...register(`ingredientes.${idx}.ingrediente_id`, { required: true })}>
                  <option value="">Selecione</option>
                  {ingredientes.map((i) => <option key={i.id} value={i.id}>{i.nome} ({i.unidade})</option>)}
                </select>
                <div className="relative w-28">
                  <input className="input w-full pr-9" type="number" step="0.1" placeholder={unidadeSel || 'qtd'}
                    {...register(`ingredientes.${idx}.quantidade_g`, { required: true })} />
                  {unidadeSel && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-mute pointer-events-none">
                      {unidadeSel}
                    </span>
                  )}
                </div>
                <button type="button" onClick={() => removeIng(idx)}
                  className="p-3 font-mono text-mute active:text-rust">✕</button>
              </div>
              )
            })}
          </div>
        </div>

        {/* Etapas MO */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="label">Mão de obra</p>
            <button type="button" onClick={() => appendMo({ descricao: '', tempo_min: '' })}
              className="font-mono text-xs uppercase tracking-widest text-ink border border-ink px-3 py-1">
              + Adicionar
            </button>
          </div>
          <div className="space-y-2">
            {moFields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-start">
                <input className="input flex-1" placeholder="Descrição da etapa"
                  {...register(`etapas_mo.${idx}.descricao`, { required: true })} />
                <input className="input w-24" type="number" step="1" placeholder="min"
                  {...register(`etapas_mo.${idx}.tempo_min`, { required: true })} />
                <button type="button" onClick={() => removeMo(idx)}
                  className="p-3 font-mono text-mute active:text-rust">✕</button>
              </div>
            ))}
          </div>
        </div>

        {erro && <p className="font-sans text-sm text-rust">{erro}</p>}
      </form>
      <div className="fixed bottom-16 left-0 right-0 bg-bone border-t border-line px-4 py-3 z-30">
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          className="btn-primary w-full max-w-xl mx-auto block"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar receita'}
        </button>
      </div>
    </Layout>
  )
}
