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

  // Plano vendido hoje: só o mensal (fase de teste). Preço real vem do Stripe;
  // fallback 19.90 mantém o botão certo mesmo antes de /planos responder.
  const { data: planosData } = useQuery({
    queryKey: ['billing-planos'],
    queryFn: () => listarPlanos().then((r) => r.data),
    staleTime: 60 * 60_000,
  })
  const planos = planosData?.planos ?? []
  const mensal = planos.find((p) => p.plano === 'mensal')
  const precoMensal = mensal?.preco ?? 19.9

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
  const limite = data?.produtos_limite ?? 1
  const unidade = limite === 1 ? 'produto' : 'produtos'
  const noLimite = !pago && usados >= limite

  return (
    <Layout title="Assinatura" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-6 space-y-4">
        {erro && (
          <div className="bg-danger-bg text-on-danger-bg rounded-xl px-3 py-2">
            <p className="font-sans text-sm">{erro}</p>
          </div>
        )}

        {sucesso && !pago && (
          <div className="bg-positive-bg text-positive rounded-xl px-4 py-3">
            <p className="font-sans text-sm">Pagamento recebido — liberando seu acesso...</p>
          </div>
        )}

        {/* Situação atual — em palavras simples */}
        <div className="card space-y-3">
          {pago ? (
            <>
              <p className="label text-primary">Plano completo</p>
              <p className="text-on-surface font-serif font-bold text-lg">✓ Quantum completo</p>
              <p className="font-sans text-sm text-on-surface">
                Produtos sem limite{data?.validade ? ` — vale até ${dataBR(data.validade)}` : ''}
              </p>
            </>
          ) : (
            <>
              <p className="label text-primary">Plano grátis</p>
              <p className="font-sans text-sm text-on-surface">
                Você usou <strong className="qtm-num">{usados}</strong> de{' '}
                <strong className="qtm-num">{limite}</strong> {unidade} grátis.
              </p>
              {/* Barra de progresso de uso */}
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(100, (usados / limite) * 100)}%` }}
                />
              </div>
              {noLimite ? (
                <p className="font-sans text-sm text-danger">
                  Você chegou no limite. Assine para criar quantos produtos quiser.
                </p>
              ) : (
                <p className="font-sans text-xs text-on-surface-dim">
                  Sem prazo pra acabar — o grátis é seu pra sempre, até {limite} {unidade}.
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
                <p key={t} className="font-sans text-sm text-on-surface flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />{t}
                </p>
              ))}
            </div>

            <button
              onClick={() => redirecionar(() => criarCheckout('mensal'))}
              disabled={carregandoAcao}
              className="btn-primary w-full"
            >
              {carregandoAcao ? 'Abrindo...' : `Assinar — ${brl(precoMensal)} por mês`}
            </button>
            <p className="font-sans text-xs text-on-surface-dim text-center">
              Sem fidelidade — cancele quando quiser.
            </p>
          </>
        )}

        {(pago || data?.validade) && (
          <button
            onClick={() => redirecionar(abrirPortal)}
            disabled={carregandoAcao}
            className="btn-secondary w-full"
          >
            Gerenciar assinatura
          </button>
        )}

        <p className="font-sans text-xs text-on-surface-dim">
          Pagamento seguro pelo Stripe. Pode cancelar quando quiser.
        </p>
      </div>
    </Layout>
  )
}
