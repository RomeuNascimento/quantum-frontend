import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import FormField from '../../components/FormField'
import LoadingSpinner from '../../components/LoadingSpinner'
import CalculadoraValorHora from '../../components/CalculadoraValorHora'
import useVoltar from '../../hooks/useVoltar'
import { listarColaboradores, criarColaborador, atualizarColaborador } from '../../api/colaboradores'

// Chaves cujos cálculos dependem do valor-hora de um colaborador (custo de MO)
const CHAVES_CUSTO = ['receitas', 'produtos', 'relatorio-margem', 'precos-produto', 'receita', 'produto', 'historico-custo-produto']

export default function ColaboradorForm() {
  const { id } = useParams()
  const isEdit = !!id
  const voltar = useVoltar('/colaboradores')
  const queryClient = useQueryClient()

  const [nome, setNome] = useState('')
  const [valorHora, setValorHora] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  // Na edição não há GET /{id} — pega da lista já carregada (só ativos)
  const listaQ = useQuery({
    queryKey: ['colaboradores'],
    enabled: isEdit,
    queryFn: () => listarColaboradores().then((r) => r.data),
  })
  const atual = isEdit ? (listaQ.data || []).find((c) => String(c.id) === String(id)) : null

  const preenchido = useRef(false)
  useEffect(() => { preenchido.current = false }, [id])
  useEffect(() => {
    if (atual && !preenchido.current) {
      setNome(atual.nome)
      setValorHora(String(atual.valor_hora))
      preenchido.current = true
    }
  }, [atual])

  const salvar = async () => {
    setErro('')
    const v = parseFloat(String(valorHora).replace(',', '.'))
    if (!nome.trim()) { setErro('Informe o nome.'); return }
    if (isNaN(v) || v < 0) { setErro('Informe um valor-hora válido (0 ou mais).'); return }
    setLoading(true)
    try {
      const payload = { nome: nome.trim(), valor_hora: v }
      if (isEdit) await atualizarColaborador(id, payload)
      else await criarColaborador(payload)
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] })
      CHAVES_CUSTO.forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }))
      voltar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (isEdit && listaQ.isLoading) {
    return (
      <Layout title="Editar colaborador" onBack={voltar}>
        <div className="px-4 pt-10"><LoadingSpinner /></div>
      </Layout>
    )
  }

  return (
    <Layout title={isEdit ? 'Editar colaborador' : 'Novo colaborador'} onBack={voltar}>
      <div className="px-4 pt-4 pb-24 space-y-4">
        <FormField label="Nome">
          <input className="input" value={nome} onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Ana, Auxiliar, Você" />
        </FormField>

        <div className="card space-y-2">
          <label htmlFor="vh-colab" className="text-sm text-ink block">Valor da hora de trabalho (R$)</label>
          <input id="vh-colab" className="input qtm-num" inputMode="decimal" value={valorHora}
            onChange={(e) => setValorHora(e.target.value)} placeholder="Ex.: 25" />
          <p className="text-xs text-mute">
            Quanto a hora desta pessoa custa. Não sabe? Calcule a partir do salário.
          </p>
          <CalculadoraValorHora idPrefix="colab" onUsar={(valor) => setValorHora(valor.toFixed(2))} />
        </div>

        {erro && <p className="font-sans text-sm text-rust">{erro}</p>}
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-bone border-t border-line px-4 py-3 z-30">
        <button type="button" onClick={salvar} disabled={loading}
          className="btn-primary w-full max-w-xl mx-auto block">
          {loading ? 'Salvando...' : 'Salvar colaborador'}
        </button>
      </div>
    </Layout>
  )
}
