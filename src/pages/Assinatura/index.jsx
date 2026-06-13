import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { billingStatus, listarPlanos, criarCheckout, abrirPortal } from '../../api/billing'
import { brl } from '../../utils/format'

const dataBR = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : null)

export default function Assinatura() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const sucesso = params.get('sucesso') === '1'
  const [erro, setErro] = useState('')
  const [carregandoAcao, setCarregandoAcao] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['billing-status'],
    queryFn: () => billingStatus().then((r) => r.data),
    // após voltar do checkout, o webhook pode levar alguns segundos
    refetchInterval: sucesso ? 3000 : false,
  })

  // Planos disponíveis (anual sempre; mensal se configurado no servidor)
  const { data: planosData } = useQuery({
    queryKey: ['billing-planos'],
    queryFn: () => listarPlanos().then((r) => r.data),
    staleTime: 60 * 60_000,
  })
  const planos = planosData?.planos ?? []
  const anual = planos.find((p) => p.plano === 'anual')
  const mensal = planos.find((p) => p.plano === 'mensal')

  const redirecionar = async (fn) => {
    setErro('')
    setCarregandoAcao(true)
    try {
      const r = await fn()
      window.location.href = r.data.url
    } catch (e) {
      setErro(e.message)
      setCarregandoAcao(false)
    }
  }

  if (isLoading) return <Layout title="Assinatura"><LoadingSpinner /></Layout>

  const status = data?.status
  return (
    <Layout title="Assinatura" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-6 space-y-4">
        {erro && (
          <div className="bg-rust/10 border border-rust px-3 py-2">
            <p className="font-sans text-sm text-rust">{erro}</p>
          </div>
        )}

        {sucesso && status !== 'ativa' && (
          <div className="border border-lime bg-lime/10 px-4 py-3">
            <p className="font-sans text-sm text-ink">Pagamento recebido — ativando sua assinatura...</p>
          </div>
        )}

        <div className="card space-y-2">
          <p className="label">Plano</p>
          <p className="text-ink font-bold">Quantum</p>
          <p className="qtm-num text-2xl font-bold text-ink">
            {brl(anual?.preco ?? 147)}<span className="text-sm font-normal text-mute">/ano</span>
          </p>
          {mensal && (
            <p className="qtm-num text-sm text-mute">
              ou {brl(mensal.preco)}/mês — no anual você economiza {brl(mensal.preco * 12 - (anual?.preco ?? 147))}
            </p>
          )}

          <p className="label pt-2">Status</p>
          {status === 'ativa' && (
            <p className="font-sans text-sm text-ink">
              ✓ Ativa{data.validade ? ` — renova em ${dataBR(data.validade)}` : ''}
            </p>
          )}
          {status === 'trial' && (
            <p className="font-sans text-sm text-ink">
              Período de teste — termina em {dataBR(data.trial_fim)}
            </p>
          )}
          {status === 'vencida' && (
            <p className="font-sans text-sm text-rust">Assinatura vencida ou teste encerrado</p>
          )}
        </div>

        {status !== 'ativa' && (
          <>
            <button
              onClick={() => redirecionar(() => criarCheckout('anual'))}
              disabled={carregandoAcao}
              className="btn-primary w-full"
            >
              {carregandoAcao ? 'Abrindo...' : `Assinar anual — ${brl(anual?.preco ?? 147)}/ano`}
            </button>
            {mensal && (
              <button
                onClick={() => redirecionar(() => criarCheckout('mensal'))}
                disabled={carregandoAcao}
                className="btn-ghost w-full"
              >
                {carregandoAcao ? 'Abrindo...' : `Assinar mensal — ${brl(mensal.preco)}/mês`}
              </button>
            )}
          </>
        )}
        {(status === 'ativa' || data?.validade) && (
          <button
            onClick={() => redirecionar(abrirPortal)}
            disabled={carregandoAcao}
            className="btn-ghost w-full"
          >
            Gerenciar assinatura
          </button>
        )}

        <p className="font-sans text-xs text-mute">
          Pagamento processado pelo Stripe. Cancele quando quiser pelo botão acima.
        </p>
      </div>
    </Layout>
  )
}
