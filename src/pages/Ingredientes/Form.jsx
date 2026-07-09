import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import useVoltar from '../../hooks/useVoltar'
import { useForm } from 'react-hook-form'
import Layout from '../../components/Layout'
import FormField from '../../components/FormField'
import ConfirmDialog from '../../components/ConfirmDialog'
import { criarIngrediente, detalharIngrediente, atualizarIngrediente, adicionarPrecoIngrediente, converterEmEmbalagem } from '../../api/ingredientes'
import { brl, brl4 } from '../../utils/format'

const unidades = ['g', 'ml', 'unid', 'kg', 'L']

// Trava do bug kg/L: em kg/L a quantidade é o peso NA UNIDADE (pacote de 1kg = 1).
// Número alto (≥100) quase sempre é gramas digitadas por engano → custo ~1000× baixo.
const SUSPEITO_KGL = 100
const ehKgL = (u) => u === 'kg' || u === 'L'
const numero = (v) => parseFloat(String(v ?? '').replace(',', '.'))
const placeholderQtd = (u) => {
  if (u === 'kg') return 'Ex: 1 (pacote de 1 kg)'
  if (u === 'L') return 'Ex: 1 (garrafa de 1 L)'
  if (u === 'unid') return 'Ex: 12 (cartela com 12)'
  return 'Ex: 1000'
}
const dicaQtd = (u) => {
  if (ehKgL(u)) return `Peso da embalagem em ${u} — pacote de 1 ${u} = 1 (não 1000).`
  if (u === 'unid') return 'Quantas unidades vêm na embalagem.'
  return 'Peso/volume total da embalagem (ex: pacote de 1 kg = 1000 g).'
}

export default function IngredienteForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const voltar = useVoltar('/ingredientes')
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [showPreco, setShowPreco] = useState(false)
  const [confirmConverter, setConfirmConverter] = useState(false)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: { fator_correcao: 1 },
  })
  const { register: regPreco, handleSubmit: submitPreco, reset: resetPreco, watch: watchPreco, formState: { errors: errPreco } } = useForm()

  const detalheQ = useQuery({
    queryKey: ['ingrediente', id],
    enabled: isEdit,
    queryFn: () => detalharIngrediente(id).then((r) => r.data),
  })
  const historico = detalheQ.data?.historico_precos ?? []

  // Preenche o form só na primeira chegada dos dados — refetches posteriores
  // (ex: após registrar preço) não podem sobrescrever edições do usuário
  const formPreenchido = useRef(false)
  useEffect(() => { formPreenchido.current = false }, [id])
  useEffect(() => {
    if (detalheQ.data && !formPreenchido.current) {
      reset(detalheQ.data)
      formPreenchido.current = true
    }
  }, [detalheQ.data, reset])

  const onSubmit = async (dados) => {
    setErro('')
    setLoading(true)
    try {
      if (isEdit) {
        await atualizarIngrediente(id, dados)
      } else {
        const payload = { ...dados }
        if (dados.preco && dados.quantidade_embalagem) {
          payload.preco_inicial = {
            preco: parseFloat(dados.preco),
            quantidade_embalagem: parseFloat(dados.quantidade_embalagem),
            data_compra: new Date().toISOString(),
          }
        }
        await criarIngrediente(payload)
      }
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] })
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['ingrediente', id] })
      voltar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  const onAddPreco = async (dados) => {
    setErro('')
    try {
      await adicionarPrecoIngrediente(id, {
        ...dados,
        preco: parseFloat(dados.preco),
        quantidade_embalagem: parseFloat(dados.quantidade_embalagem),
        data_compra: new Date().toISOString(),
      })
      resetPreco()
      setShowPreco(false)
      // Preço novo muda custo do ingrediente e tudo que deriva dele
      queryClient.invalidateQueries({ queryKey: ['ingrediente', id] })
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] })
      queryClient.invalidateQueries({ queryKey: ['precos-produto'] })
      queryClient.invalidateQueries({ queryKey: ['relatorio-margem'] })
    } catch (e) {
      setErro(e.message)
      setShowPreco(false)
    }
  }

  // Aviso do bug kg/L (create form e "adicionar preço")
  const unidadeSel = watch('unidade')
  const alertaKgL = ehKgL(unidadeSel) && numero(watch('quantidade_embalagem')) >= SUSPEITO_KGL
  const unidadeIng = detalheQ.data?.unidade
  const alertaPreco = ehKgL(unidadeIng) && numero(watchPreco('quantidade_embalagem')) >= SUSPEITO_KGL

  return (
    <Layout title={isEdit ? 'Editar ingrediente' : 'Novo ingrediente'} onBack={voltar}>
      <div className="px-4 pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="card space-y-1">
            <FormField label="Nome" error={errors.nome?.message}>
              <input className="input" placeholder="Ex: Farinha de trigo" {...register('nome', { required: 'Obrigatório' })} />
            </FormField>

            <FormField label="Marca (opcional)">
              <input className="input" placeholder="Ex: Fleischmann" {...register('marca')} />
            </FormField>

            <FormField label="Unidade" error={errors.unidade?.message}>
              <select className="input" {...register('unidade', { required: 'Obrigatório' })}>
                <option value="">Selecione</option>
                {unidades.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </FormField>

            <FormField label="Fator de correção" error={errors.fator_correcao?.message}>
              <input className="input" type="number" step="0.01" placeholder="1.0"
                {...register('fator_correcao', { required: 'Obrigatório', min: { value: 0, message: 'Não pode ser negativo' } })} />
              <p className="font-sans text-xs text-on-surface-dim mt-1">Percentual aproveitável. Ex: 0.85 para 85% de aproveitamento. 0 = sem correção</p>
            </FormField>
          </div>

          {!isEdit && (
            <div className="card space-y-1">
              <p className="label">Preço de compra (opcional)</p>
              <FormField label="Preço pago (R$)">
                <input className="input" type="number" step="0.01" placeholder="Ex: 4.50" {...register('preco')} />
              </FormField>
              <FormField label={`Quantidade na embalagem${unidadeSel ? ` (em ${unidadeSel})` : ''}`}>
                <input className="input" type="number" step="0.001" placeholder={placeholderQtd(unidadeSel)} {...register('quantidade_embalagem')} />
                <p className="font-sans text-xs text-on-surface-dim mt-1">{dicaQtd(unidadeSel)}</p>
                {alertaKgL && (
                  <p className="font-sans text-xs text-on-danger-bg bg-danger-bg rounded-lg px-3 py-2 mt-2">
                    ⚠️ Confira: em <b>{unidadeSel}</b>, um pacote de 1 {unidadeSel} = <b>1</b> (não 1000). Número tão alto costuma ser gramas por engano — deixaria o custo ~1000× baixo.
                  </p>
                )}
              </FormField>
            </div>
          )}

          {erro && (
            <div className="bg-danger-bg text-on-danger-bg rounded-xl px-4 py-3">
              <p className="font-sans text-sm">{erro}</p>
            </div>
          )}

          <div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>

        {isEdit && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="label mb-0">Histórico de preços</p>
              <button
                onClick={() => setShowPreco(!showPreco)}
                className="font-mono text-xs uppercase tracking-widest text-primary border border-outline-strong rounded-full px-3 py-1"
              >
                + Adicionar
              </button>
            </div>

            {showPreco && (
              <form onSubmit={submitPreco(onAddPreco)} className="card mb-3 space-y-3">
                <FormField label="Preço (R$)" error={errPreco.preco?.message}>
                  <input className="input" type="number" step="0.01" {...regPreco('preco', { required: true })} />
                </FormField>
                <FormField label={`Qtd embalagem${unidadeIng ? ` (em ${unidadeIng})` : ''}`} error={errPreco.quantidade_embalagem?.message}>
                  <input className="input" type="number" step="0.001" placeholder={placeholderQtd(unidadeIng)} {...regPreco('quantidade_embalagem', { required: true })} />
                  {ehKgL(unidadeIng) && (
                    <p className="font-sans text-xs text-on-surface-dim mt-1">Em {unidadeIng}: pacote de 1 {unidadeIng} = 1.</p>
                  )}
                  {alertaPreco && (
                    <p className="font-sans text-xs text-on-danger-bg bg-danger-bg rounded-lg px-3 py-2 mt-2">
                      ⚠️ Confira: 1 {unidadeIng} = 1 (não 1000). Número alto costuma ser gramas por engano.
                    </p>
                  )}
                </FormField>
                <button type="submit" className="btn-primary">Registrar preço</button>
              </form>
            )}

            {historico.length > 0 && (
              <div className="card py-0">
                {historico.map((p) => (
                  <div key={p.id} className="flex justify-between border-b border-outline py-3 last:border-b-0">
                    <div>
                      <p className="qtm-num text-sm text-on-surface">{brl(p.preco)} / {p.quantidade_embalagem} un</p>
                      <p className="font-mono text-xs text-on-surface-dim">{new Date(p.data_compra).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="qtm-num text-sm font-bold text-on-surface">{brl4(p.custo_unitario)}/un</p>
                      <p className="font-mono text-xs text-on-surface-dim">{p.origem}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reclassificação: cadastrou como ingrediente mas é embalagem (caixa, saco...) */}
            <button
              type="button"
              onClick={() => setConfirmConverter(true)}
              className="btn-ghost mt-6 text-xs py-2"
            >
              Converter em embalagem
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmConverter}
        onClose={() => setConfirmConverter(false)}
        onConfirm={async () => {
          setConfirmConverter(false)
          setErro('')
          try {
            await converterEmEmbalagem(id)
            queryClient.invalidateQueries({ queryKey: ['ingredientes'] })
            queryClient.invalidateQueries({ queryKey: ['embalagens'] })
            navigate('/embalagens')
          } catch (e) {
            setErro(e.message)
          }
        }}
        title="Converter em embalagem"
        message={`"${detalheQ.data?.nome}" vira uma embalagem com o histórico de preços copiado. Receitas que já usam este ingrediente continuam calculando normalmente.`}
        confirmLabel="Converter"
      />
    </Layout>
  )
}
