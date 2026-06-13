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

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { fator_correcao: 1 },
  })
  const { register: regPreco, handleSubmit: submitPreco, reset: resetPreco, formState: { errors: errPreco } } = useForm()

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

  return (
    <Layout title={isEdit ? 'Editar ingrediente' : 'Novo ingrediente'} onBack={voltar}>
      <div className="px-4 pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
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
            <p className="font-mono text-xs text-mute mt-1">Percentual aproveitável. Ex: 0.85 para 85% de aproveitamento. 0 = sem correção</p>
          </FormField>

          {!isEdit && (
            <>
              <p className="label pt-2">Preço de compra (opcional)</p>
              <FormField label="Preço pago (R$)">
                <input className="input" type="number" step="0.01" placeholder="Ex: 4.50" {...register('preco')} />
              </FormField>
              <FormField label="Quantidade na embalagem">
                <input className="input" type="number" step="0.001" placeholder="Ex: 1000 (g)" {...register('quantidade_embalagem')} />
              </FormField>
            </>
          )}

          {erro && <p className="font-sans text-sm text-rust">{erro}</p>}

          <div className="pt-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>

        {isEdit && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="label">Histórico de preços</p>
              <button
                onClick={() => setShowPreco(!showPreco)}
                className="font-mono text-xs uppercase tracking-widest text-ink border border-ink px-3 py-1"
              >
                + Adicionar
              </button>
            </div>

            {showPreco && (
              <form onSubmit={submitPreco(onAddPreco)} className="card mb-3 space-y-3">
                <FormField label="Preço (R$)" error={errPreco.preco?.message}>
                  <input className="input" type="number" step="0.01" {...regPreco('preco', { required: true })} />
                </FormField>
                <FormField label="Qtd embalagem" error={errPreco.quantidade_embalagem?.message}>
                  <input className="input" type="number" step="0.001" {...regPreco('quantidade_embalagem', { required: true })} />
                </FormField>
                <button type="submit" className="btn-primary">Registrar preço</button>
              </form>
            )}

            <div>
              {historico.map((p) => (
                <div key={p.id} className="flex justify-between border-b border-line py-3 last:border-b-0">
                  <div>
                    <p className="qtm-num text-sm text-ink">{brl(p.preco)} / {p.quantidade_embalagem} un</p>
                    <p className="font-mono text-xs text-mute">{new Date(p.data_compra).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="qtm-num text-sm font-bold text-ink">{brl4(p.custo_unitario)}/un</p>
                    <p className="font-mono text-xs text-mute">{p.origem}</p>
                  </div>
                </div>
              ))}
            </div>

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
