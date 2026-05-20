import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import Layout from '../../components/Layout'
import FormField from '../../components/FormField'
import { criarReceita, detalharReceita, atualizarReceita } from '../../api/receitas'
import { listarIngredientes } from '../../api/ingredientes'

export default function ReceitaForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [ingredientes, setIngredientes] = useState([])

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: { ingredientes: [], etapas_mo: [] },
  })
  const { fields: ingFields, append: appendIng, remove: removeIng } = useFieldArray({ control, name: 'ingredientes' })
  const { fields: moFields, append: appendMo, remove: removeMo } = useFieldArray({ control, name: 'etapas_mo' })

  useEffect(() => {
    listarIngredientes().then((r) => setIngredientes(r.data))
    if (isEdit) {
      detalharReceita(id).then((r) => {
        reset({
          nome: r.data.nome,
          tipo: r.data.tipo,
          rendimento_g: r.data.rendimento_g,
          ingredientes: r.data.ingredientes.map((i) => ({
            ingrediente_id: i.ingrediente_id,
            quantidade_g: i.quantidade_g,
          })),
          etapas_mo: r.data.etapas_mo.map((e) => ({
            descricao: e.descricao,
            tempo_min: e.tempo_min,
          })),
        })
      })
    }
  }, [id])

  const onSubmit = async (dados) => {
    setErro('')
    setLoading(true)
    try {
      const payload = {
        ...dados,
        rendimento_g: parseFloat(dados.rendimento_g),
        ingredientes: dados.ingredientes.map((i) => ({
          ingrediente_id: parseInt(i.ingrediente_id),
          quantidade_g: parseFloat(i.quantidade_g),
        })),
        etapas_mo: dados.etapas_mo.map((e) => ({
          descricao: e.descricao,
          tempo_min: parseFloat(e.tempo_min),
        })),
      }
      if (isEdit) {
        await atualizarReceita(id, payload)
      } else {
        await criarReceita(payload)
      }
      navigate('/receitas')
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title={isEdit ? 'Editar receita' : 'Nova receita'} onBack={() => navigate('/receitas')}>
      <form onSubmit={handleSubmit(onSubmit)} className="px-4 pt-4 space-y-4">
        <FormField label="Nome da receita" error={errors.nome?.message}>
          <input className="input" {...register('nome', { required: 'Obrigatório' })} />
        </FormField>

        <FormField label="Tipo" error={errors.tipo?.message}>
          <select className="input" {...register('tipo', { required: 'Obrigatório' })}>
            <option value="">Selecione</option>
            <option value="massa">Massa</option>
            <option value="recheio">Recheio</option>
          </select>
        </FormField>

        <FormField label="Rendimento (g)" error={errors.rendimento_g?.message}>
          <input className="input" type="number" step="0.1"
            {...register('rendimento_g', { required: 'Obrigatório' })} />
        </FormField>

        {/* Ingredientes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Ingredientes</h3>
            <button type="button" onClick={() => appendIng({ ingrediente_id: '', quantidade_g: '' })}
              className="text-sm text-primary-600 font-medium">+ Adicionar</button>
          </div>
          <div className="space-y-2">
            {ingFields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-start">
                <select className="input flex-1" {...register(`ingredientes.${idx}.ingrediente_id`, { required: true })}>
                  <option value="">Selecione</option>
                  {ingredientes.map((i) => <option key={i.id} value={i.id}>{i.nome} ({i.unidade})</option>)}
                </select>
                <input className="input w-28" type="number" step="0.1" placeholder="g"
                  {...register(`ingredientes.${idx}.quantidade_g`, { required: true })} />
                <button type="button" onClick={() => removeIng(idx)} className="p-3 text-red-400">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Etapas MO */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Mão de obra</h3>
            <button type="button" onClick={() => appendMo({ descricao: '', tempo_min: '' })}
              className="text-sm text-primary-600 font-medium">+ Adicionar</button>
          </div>
          <div className="space-y-2">
            {moFields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-start">
                <input className="input flex-1" placeholder="Descrição da etapa"
                  {...register(`etapas_mo.${idx}.descricao`, { required: true })} />
                <input className="input w-24" type="number" step="1" placeholder="min"
                  {...register(`etapas_mo.${idx}.tempo_min`, { required: true })} />
                <button type="button" onClick={() => removeMo(idx)} className="p-3 text-red-400">✕</button>
              </div>
            ))}
          </div>
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar receita'}
        </button>
      </form>
    </Layout>
  )
}
