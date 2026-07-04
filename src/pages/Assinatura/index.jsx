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

  // Freemium: 'pago' = ilimitado; 'gratis' = até N produtos, sem prazo
  const pago = data?.plano === 'pago'
  const usados = data?.produtos_usados ?? 0
  const limite = data?.produtos_limite ?? 3
  const noLimite = !pago && usados >= limite

  return (
    <Layout title="Assinatura" onBack={() => navigate('/assistente')}>
      <div className="px-4 pt-6 space-y-4">
        {erro && (
          <div className="bg-rust/10 border border-rust px-3 py-2">
            <p className="font-sans text-sm text-rust">{erro}</p>
          </div>
        )}

        {sucesso && !pago && (
          <div className="border border-lime bg-lime/10 px-4 py-3">
            <p className="font-sans text-sm text-ink">Pagamento recebido — liberando seu acesso...</p>
          </div>
        )}

        {/* Situação atual — em palavras simples */}
        <div className="card space-y-2">
          <p className="label">Seu plano hoje</p>
          {pago ? (
            <>
              <p className="text-ink font-bold">✓ Quantum completo</p>
              <p className="font-sans text-sm text-ink">
                Produtos sem limite{data?.validade ? ` — vale até ${dataBR(data.validade)}` : ''}
              </p>
            </>
          ) : (
            <>
              <p className="text-ink font-bold">Grátis</p>
              <p className="font-sans text-sm text-ink">
                Você usou <strong className="qtm-num">{usados}</strong> de{' '}
                <strong className="qtm-num">{limite}</strong> produtos grátis.
              </p>
              {noLimite ? (
                <p className="font-sans text-sm text-rust">
                  Você chegou no limite. Assine para criar quantos produtos quiser.
                </p>
              ) : (
                <p className="font-sans text-xs text-mute">
                  Sem prazo pra acabar — o grátis é seu pra sempre, até {limite} produtos.
                </p>
              )}
            </>
          )}
        </div>

        {!pago && (
          <>
            {/* O que ganha assinando */}
            <div className="card space-y-1.5">
              <p className="label">Assinando você ganha</p>
              {['Produtos sem limite', 'Leitura de nota fiscal por foto', 'Preço certo em todos os canais'].map((t) => (
                <p key={t} className="font-sans text-sm text-ink flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-lime flex-shrink-0" />{t}
                </p>
              ))}
            </div>

            <button
              onClick={() => redirecionar(() => criarCheckout('anual'))}
              disabled={carregandoAcao}
              className="btn-primary w-full"
            >
              {carregandoAcao ? 'Abrindo...' : `Assinar — ${brl(anual?.preco ?? 147)} por ano`}
            </button>
            {mensal && (
              <button
                onClick={() => redirecionar(() => criarCheckout('mensal'))}
                disabled={carregandoAcao}
                className="btn-ghost w-full"
              >
                {carregandoAcao ? 'Abrindo...' : `Ou ${brl(mensal.preco)} por mês`}
              </button>
            )}
            {mensal && (
              <p className="font-sans text-xs text-mute text-center">
                No anual você economiza {brl(mensal.preco * 12 - (anual?.preco ?? 147))} por ano.
              </p>
            )}
          </>
        )}

        {(pago || data?.validade) && (
          <button
            onClick={() => redirecionar(abrirPortal)}
            disabled={carregandoAcao}
            className="btn-ghost w-full"
          >
            Gerenciar assinatura
          </button>
        )}

        <p className="font-sans text-xs text-mute">
          Pagamento seguro pelo Stripe. Pode cancelar quando quiser.
        </p>
      </div>
    </Layout>
  )
}
