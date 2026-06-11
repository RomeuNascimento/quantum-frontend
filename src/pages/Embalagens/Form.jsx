import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import useVoltar from '../../hooks/useVoltar'
import Layout from '../../components/Layout'
import FormField from '../../components/FormField'
import { criarEmbalagem, detalharEmbalagem, atualizarEmbalagem, adicionarPrecoEmbalagem } from '../../api/embalagens'

const unidades = ['g', 'ml', 'unid', 'kg', 'L']

export default function EmbalagemForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const voltar = useVoltar('/embalagens')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [historico, setHistorico] = useState([])
  const [showPreco, setShowPreco] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { register: regPreco, handleSubmit: submitPreco, reset: resetPreco } = useForm()

  useEffect(() => {
    if (isEdit) {
      detalharEmbalagem(id).then((r) => {
        reset(r.data)
        setHistorico(r.data.historico_precos || [])
      })
    }
  }, [id])

  const onSubmit = async (dados) => {
    setErro('')
    setLoading(true)
    try {
      if (isEdit) {
        await atualizarEmbalagem(id, dados)
      } else {
        const payload = { ...dados }
        if (dados.preco && dados.quantidade_embalagem) {
          payload.preco_inicial = {
            preco: parseFloat(dados.preco),
            quantidade_embalagem: parseFloat(dados.quantidade_embalagem),
            data_compra: new Date().toISOString(),
          }
        }
        await criarEmbalagem(payload)
      }
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
      await adicionarPrecoEmbalagem(id, {
        ...dados,
        preco: parseFloat(dados.preco),
        quantidade_embalagem: parseFloat(dados.quantidade_embalagem),
        data_compra: new Date().toISOString(),
      })
      resetPreco()
      setShowPreco(false)
      detalharEmbalagem(id).then((r) => setHistorico(r.data.historico_precos || []))
    } catch (e) {
      setErro(e.message)
      setShowPreco(false)
    }
  }

  return (
    <Layout title={isEdit ? 'Editar embalagem' : 'Nova embalagem'} onBack={voltar}>
      <div className="px-4 pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
          <FormField label="Nome" error={errors.nome?.message}>
            <input className="input" placeholder="Ex: Caixa kraft 15cm" {...register('nome', { required: 'Obrigatório' })} />
          </FormField>
          <FormField label="Unidade" error={errors.unidade?.message}>
            <select className="input" {...register('unidade', { required: 'Obrigatório' })}>
              <option value="">Selecione</option>
              {unidades.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </FormField>
          {!isEdit && (
            <>
              <p className="label pt-2">Preço de compra (opcional)</p>
              <FormField label="Preço pago (R$)">
                <input className="input" type="number" step="0.01" {...register('preco')} />
              </FormField>
              <FormField label="Quantidade na embalagem">
                <input className="input" type="number" step="0.001" {...register('quantidade_embalagem')} />
              </FormField>
            </>
          )}
          {erro && <p className="font-mono text-sm text-rust">{erro}</p>}
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
                <FormField label="Preço (R$)">
                  <input className="input" type="number" step="0.01" {...regPreco('preco', { required: true })} />
                </FormField>
                <FormField label="Qtd embalagem">
                  <input className="input" type="number" step="0.001" {...regPreco('quantidade_embalagem', { required: true })} />
                </FormField>
                <button type="submit" className="btn-primary">Registrar preço</button>
              </form>
            )}
            <div>
              {historico.map((p) => (
                <div key={p.id} className="flex justify-between border-b border-line py-3 last:border-b-0">
                  <div>
                    <p className="qtm-num text-sm text-ink">R$ {p.preco.toFixed(2)} / {p.quantidade_embalagem} un</p>
                    <p className="font-mono text-xs text-mute">{new Date(p.data_compra).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <p className="qtm-num text-sm font-bold text-ink">R$ {p.custo_unitario?.toFixed(4)}/un</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
