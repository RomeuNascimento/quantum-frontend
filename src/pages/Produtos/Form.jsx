import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import Layout from '../../components/Layout'
import FormField from '../../components/FormField'
import SimuladorPreco from '../../components/SimuladorPreco'
import useVoltar from '../../hooks/useVoltar'
import CustoLineChart from '../../components/CustoLineChart'
import { criarProduto, detalharProduto, atualizarProduto, historicoCustoProduto } from '../../api/produtos'
import { listarReceitas } from '../../api/receitas'
import { listarIngredientes } from '../../api/ingredientes'
import { listarEmbalagens } from '../../api/embalagens'

export default function ProdutoForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const voltar = useVoltar('/produtos')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [receitas, setReceitas] = useState([])
  const [ingredientes, setIngredientes] = useState([])
  const [embalagens, setEmbalagens] = useState([])
  const [custoTotal, setCustoTotal] = useState(null)
  const [historico, setHistorico] = useState([])

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
      historicoCustoProduto(id).then((r) => setHistorico(r.data.pontos || [])).catch(() => {})
      detalharProduto(id).then((r) => {
        setCustoTotal(r.data.custo_total)
        reset({
          nome: r.data.nome,
          preparacoes: r.data.preparacoes.map((m) => ({ receita_id: m.receita_id, quantidade_g: m.quantidade })),
          ingredientes: r.data.ingredientes_avulsos.map((m) => ({ ingrediente_id: m.ingrediente_id, quantidade_g: m.quantidade })),
          embalagens: r.data.embalagens.map((m) => ({ embalagem_id: m.embalagem_id, quantidade: m.quantidade })),
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
      // Linhas sem entidade selecionada são descartadas — sem isso o select
      // vazio vira NaN no payload e o backend rejeita o produto inteiro
      const payload = {
        nome: dados.nome,
        preparacoes: dados.preparacoes
          .filter((m) => m.receita_id)
          .map((m) => ({ receita_id: parseInt(m.receita_id), quantidade_g: toFloat(m.quantidade_g) })),
        ingredientes: dados.ingredientes
          .filter((m) => m.ingrediente_id)
          .map((m) => ({ ingrediente_id: parseInt(m.ingrediente_id), quantidade_g: toFloat(m.quantidade_g) })),
        embalagens: dados.embalagens
          .filter((m) => m.embalagem_id)
          .map((m) => ({ embalagem_id: parseInt(m.embalagem_id), quantidade: toFloat(m.quantidade) })),
        mo_montagem: dados.mo_montagem
          .filter((m) => m.descricao)
          .map((m) => ({ descricao: m.descricao, tempo_min: toFloat(m.tempo_min) })),
      }
      if (isEdit) await atualizarProduto(id, payload)
      else await criarProduto(payload)
      voltar()
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
    <Layout title={isEdit ? 'Editar produto' : 'Novo produto'} onBack={voltar}>
      <form onSubmit={handleSubmit(onSubmit)} className="px-4 pt-4 pb-24">
        {isEdit && (
          <button type="button" onClick={() => navigate(`/produtos/${id}/ficha`)}
            className="w-full flex items-center justify-between bg-ink text-bone border border-ink px-4 py-3 mb-4 active:opacity-80">
            <span className="font-mono text-xs uppercase tracking-widest">Ficha técnica (PDF)</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

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

        {isEdit && historico.length >= 2 && (
          <div className="card mt-4">
            <p className="label mb-2">Evolução do custo</p>
            <CustoLineChart pontos={historico} />
          </div>
        )}

        {isEdit && custoTotal != null && custoTotal > 0 && (
          <SimuladorPreco custo={custoTotal} />
        )}

        {erro && <p className="font-mono text-sm text-rust mt-4">{erro}</p>}
      </form>
      <div className="fixed bottom-16 left-0 right-0 bg-bone border-t border-line px-4 py-3 z-30">
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          className="btn-primary w-full max-w-xl mx-auto block"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar produto'}
        </button>
      </div>
    </Layout>
  )
}
