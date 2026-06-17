import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
import { listarColaboradores } from '../../api/colaboradores'

export default function ProdutoForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const voltar = useVoltar('/produtos')
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    defaultValues: { preparacoes: [], ingredientes: [], embalagens: [], mo_montagem: [] },
  })
  const ingsWatch = watch('ingredientes')
  const { fields: prepFields, append: appendPrep, remove: removePrep } = useFieldArray({ control, name: 'preparacoes' })
  const { fields: ingFields, append: appendIng, remove: removeIng } = useFieldArray({ control, name: 'ingredientes' })
  const { fields: embFields, append: appendEmb, remove: removeEmb } = useFieldArray({ control, name: 'embalagens' })
  const { fields: moFields, append: appendMo, remove: removeMo } = useFieldArray({ control, name: 'mo_montagem' })

  const { data: receitas = [] } = useQuery({
    queryKey: ['receitas'],
    queryFn: () => listarReceitas().then((r) => r.data),
  })
  const { data: ingredientes = [] } = useQuery({
    queryKey: ['ingredientes'],
    queryFn: () => listarIngredientes().then((r) => r.data),
  })
  const { data: embalagens = [] } = useQuery({
    queryKey: ['embalagens'],
    queryFn: () => listarEmbalagens().then((r) => r.data),
  })
  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores'],
    queryFn: () => listarColaboradores().then((r) => r.data),
  })
  const { data: historico = [] } = useQuery({
    queryKey: ['historico-custo-produto', id],
    enabled: isEdit,
    queryFn: () => historicoCustoProduto(id).then((r) => r.data.pontos || []),
  })
  const detalheQ = useQuery({
    queryKey: ['produto', id],
    enabled: isEdit,
    queryFn: () => detalharProduto(id).then((r) => r.data),
  })
  const custoTotal = detalheQ.data?.custo_total ?? null

  // Preenche o form só na primeira chegada dos dados — refetch posterior
  // não pode sobrescrever edições do usuário
  const formPreenchido = useRef(false)
  useEffect(() => { formPreenchido.current = false }, [id])
  useEffect(() => {
    const d = detalheQ.data
    if (d && !formPreenchido.current) {
      reset({
        nome: d.nome,
        preparacoes: d.preparacoes.map((m) => ({ receita_id: m.receita_id, quantidade_g: m.quantidade })),
        ingredientes: d.ingredientes_avulsos.map((m) => ({ ingrediente_id: m.ingrediente_id, quantidade_g: m.quantidade })),
        embalagens: d.embalagens.map((m) => ({ embalagem_id: m.embalagem_id, quantidade: m.quantidade })),
        mo_montagem: d.mo_montagem.map((m) => ({ descricao: m.descricao, tempo_min: m.tempo_min, colaborador_id: m.colaborador_id ?? '' })),
      })
      formPreenchido.current = true
    }
  }, [detalheQ.data, reset])

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
          .map((m) => ({ descricao: m.descricao, tempo_min: toFloat(m.tempo_min), colaborador_id: m.colaborador_id ? parseInt(m.colaborador_id) : null })),
      }
      if (isEdit) await atualizarProduto(id, payload)
      else await criarProduto(payload)
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      queryClient.invalidateQueries({ queryKey: ['relatorio-margem'] })
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['produto', id] })
        queryClient.invalidateQueries({ queryKey: ['historico-custo-produto', id] })
        queryClient.invalidateQueries({ queryKey: ['precos-produto', Number(id)] })
      }
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
          {ingFields.map((f, i) => {
            const selId = ingsWatch?.[i]?.ingrediente_id
            const unidadeSel = ingredientes.find((r) => String(r.id) === String(selId))?.unidade || ''
            return (
            <div key={f.id} className="flex gap-2">
              <select className="input flex-1" {...register(`ingredientes.${i}.ingrediente_id`)}>
                <option value="">Ingrediente</option>
                {ingredientes.map((r) => <option key={r.id} value={r.id}>{r.nome} ({r.unidade})</option>)}
              </select>
              <div className="relative w-24">
                <input className="input w-full pr-9" type="number" step="0.1" placeholder={unidadeSel || 'qtd'}
                  {...register(`ingredientes.${i}.quantidade_g`)} />
                {unidadeSel && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-mute pointer-events-none">
                    {unidadeSel}
                  </span>
                )}
              </div>
              <button type="button" onClick={() => removeIng(i)}
                className="p-3 font-mono text-mute active:text-rust">✕</button>
            </div>
            )
          })}
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

        <Section title="Mão de obra (montagem)" onAdd={() => appendMo({ descricao: '', tempo_min: '', colaborador_id: '' })}>
          {moFields.map((f, i) => (
            <div key={f.id} className="space-y-1.5">
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="Etapa" {...register(`mo_montagem.${i}.descricao`)} />
                <input className="input w-24" type="number" step="1" placeholder="min"
                  {...register(`mo_montagem.${i}.tempo_min`)} />
                <button type="button" onClick={() => removeMo(i)}
                  className="p-3 font-mono text-mute active:text-rust">✕</button>
              </div>
              {colaboradores.length > 0 && (
                <select className="input w-full text-sm" {...register(`mo_montagem.${i}.colaborador_id`)}>
                  <option value="">Valor-hora padrão</option>
                  {colaboradores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              )}
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

        {erro && <p className="font-sans text-sm text-rust mt-4">{erro}</p>}
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
