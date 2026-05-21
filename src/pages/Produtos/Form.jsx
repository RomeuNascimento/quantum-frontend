import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import Layout from '../../components/Layout'
import FormField from '../../components/FormField'
import { criarProduto, detalharProduto, atualizarProduto } from '../../api/produtos'
import { listarReceitas } from '../../api/receitas'
import { listarIngredientes } from '../../api/ingredientes'
import { listarEmbalagens } from '../../api/embalagens'

export default function ProdutoForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [receitas, setReceitas] = useState([])
  const [ingredientes, setIngredientes] = useState([])
  const [embalagens, setEmbalagens] = useState([])

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: { preparacoes: [], ingredientes: [], embalagens: [], mo_montagem: [] },
  })
  const { fields: prepFields, append: appendPrep, remove: removePrep } = useFieldArray({ control, name: 'preparacoes' })
  const { fields: ingFields, append: appendIng, remove: removeIng } = useFieldArray({ control, name: 'ingredientes' })
  const { fields: embFields, append: appendEmb, remove: removeEmb } = useFieldArray({ control, name: 'embalagens' })
  const { fields: moFields, append: appendMo, remove: removeMo } = useFieldArray({ control, name: 'mo_montagem' })

  useEffect(() => {
    Promise.all([listarReceitas(), listarIngredientes(), listarEmbalagens()]).then(([r, i, e]) => {
      setReceitas(r.data)
      setIngredientes(i.data)
      setEmbalagens(e.data)
    })
    if (isEdit) {
      detalharProduto(id).then((r) => {
        reset({
          nome: r.data.nome,
          preparacoes: r.data.preparacoes.map((m) => ({ receita_id: m.id, quantidade_g: m.quantidade })),
          ingredientes: r.data.ingredientes_avulsos.map((m) => ({ ingrediente_id: m.id, quantidade_g: m.quantidade })),
          embalagens: r.data.embalagens.map((m) => ({ embalagem_id: m.id, quantidade: m.quantidade })),
          mo_montagem: r.data.mo_montagem.map((m) => ({ descricao: m.descricao, tempo_min: m.tempo_min })),
        })
      })
    }
  }, [id])

  const onSubmit = async (dados) => {
    setErro('')
    setLoading(true)
    try {
      const toFloat = (v) => parseFloat(v) || 0
      const payload = {
        nome: dados.nome,
        preparacoes: dados.preparacoes.map((m) => ({ receita_id: parseInt(m.receita_id), quantidade_g: toFloat(m.quantidade_g) })),
        ingredientes: dados.ingredientes.map((m) => ({ ingrediente_id: parseInt(m.ingrediente_id), quantidade_g: toFloat(m.quantidade_g) })),
        embalagens: dados.embalagens.map((m) => ({ embalagem_id: parseInt(m.embalagem_id), quantidade: toFloat(m.quantidade) })),
        mo_montagem: dados.mo_montagem.map((m) => ({ descricao: m.descricao, tempo_min: toFloat(m.tempo_min) })),
      }
      if (isEdit) await atualizarProduto(id, payload)
      else await criarProduto(payload)
      navigate('/produtos')
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  const Section = ({ title, onAdd, children }) => (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="label">{title}</p>
        <button type="button" onClick={onAdd}
          className="font-mono text-xs uppercase tracking-widest text-ink border border-ink px-3 py-1">
          + Adicionar
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )

  return (
    <Layout title={isEdit ? 'Editar produto' : 'Novo produto'} onBack={() => navigate('/produtos')}>
      <form onSubmit={handleSubmit(onSubmit)} className="px-4 pt-4 pb-6">
        <FormField label="Nome do produto" error={errors.nome?.message}>
          <input className="input" placeholder="Ex: Bolo de chocolate 1kg"
            {...register('nome', { required: 'Obrigatório' })} />
        </FormField>

        <Section title="Preparações" onAdd={() => appendPrep({ receita_id: '', quantidade_g: '' })}>
          {prepFields.map((f, i) => (
            <div key={f.id} className="flex gap-2">
              <select className="input flex-1" {...register(`preparacoes.${i}.receita_id`)}>
                <option value="">Receita</option>
                {receitas.map((r) => <option key={r.id} value={r.id}>{r.nome}{r.tipo ? ` (${r.tipo})` : ''}</option>)}
              </select>
              <input className="input w-24" type="number" step="0.1" placeholder="g"
                {...register(`preparacoes.${i}.quantidade_g`)} />
              <button type="button" onClick={() => removePrep(i)}
                className="p-3 font-mono text-mute active:text-rust">✕</button>
            </div>
          ))}
        </Section>

        <Section title="Ingredientes avulsos" onAdd={() => appendIng({ ingrediente_id: '', quantidade_g: '' })}>
          {ingFields.map((f, i) => (
            <div key={f.id} className="flex gap-2">
              <select className="input flex-1" {...register(`ingredientes.${i}.ingrediente_id`)}>
                <option value="">Ingrediente</option>
                {ingredientes.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
              </select>
              <input className="input w-24" type="number" step="0.1" placeholder="g"
                {...register(`ingredientes.${i}.quantidade_g`)} />
              <button type="button" onClick={() => removeIng(i)}
                className="p-3 font-mono text-mute active:text-rust">✕</button>
            </div>
          ))}
        </Section>

        <Section title="Embalagens" onAdd={() => appendEmb({ embalagem_id: '', quantidade: '' })}>
          {embFields.map((f, i) => (
            <div key={f.id} className="flex gap-2">
              <select className="input flex-1" {...register(`embalagens.${i}.embalagem_id`)}>
                <option value="">Embalagem</option>
                {embalagens.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
              </select>
              <input className="input w-24" type="number" step="0.001" placeholder="qtd"
                {...register(`embalagens.${i}.quantidade`)} />
              <button type="button" onClick={() => removeEmb(i)}
                className="p-3 font-mono text-mute active:text-rust">✕</button>
            </div>
          ))}
        </Section>

        <Section title="Mão de obra (montagem)" onAdd={() => appendMo({ descricao: '', tempo_min: '' })}>
          {moFields.map((f, i) => (
            <div key={f.id} className="flex gap-2">
              <input className="input flex-1" placeholder="Etapa" {...register(`mo_montagem.${i}.descricao`)} />
              <input className="input w-24" type="number" step="1" placeholder="min"
                {...register(`mo_montagem.${i}.tempo_min`)} />
              <button type="button" onClick={() => removeMo(i)}
                className="p-3 font-mono text-mute active:text-rust">✕</button>
            </div>
          ))}
        </Section>

        {erro && <p className="font-mono text-sm text-rust mt-4">{erro}</p>}
        <button type="submit" className="btn-primary mt-6" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar produto'}
        </button>
      </form>
    </Layout>
  )
}
