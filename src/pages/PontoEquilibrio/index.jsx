import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import LoadError from '../../components/LoadError'
import { resumoCustosFixos } from '../../api/custosFixos'
import { brl } from '../../utils/format'

const num = (s) => parseFloat(String(s).replace(',', '.')) || 0

export default function PontoEquilibrio() {
  const navigate = useNavigate()
  const [margem, setMargem] = useState(40)
  const [lucro, setLucro] = useState('')

  const resumoQ = useQuery({
    queryKey: ['custos-fixos-resumo'],
    queryFn: () => resumoCustosFixos().then((r) => r.data),
  })

  if (resumoQ.isLoading) {
    return (
      <Layout title="Ponto de equilíbrio" onBack={() => navigate('/dashboard')}>
        <div className="px-4 pt-10"><LoadingSpinner /></div>
      </Layout>
    )
  }
  if (resumoQ.isError) {
    return (
      <Layout title="Ponto de equilíbrio" onBack={() => navigate('/dashboard')}>
        <div className="px-4 pt-4"><LoadError onRetry={() => resumoQ.refetch()} /></div>
      </Layout>
    )
  }

  const cf = resumoQ.data?.total_mensal || 0
  const fator = margem / 100
  const breakeven = fator > 0 ? cf / fator : 0
  const lucroNum = num(lucro)
  const comLucro = fator > 0 ? (cf + lucroNum) / fator : 0

  return (
    <Layout title="Ponto de equilíbrio" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4 space-y-4 pb-8">

        {/* Custos fixos do mês */}
        <div className="card">
          <p className="label">Custos fixos do mês</p>
          <p className="text-3xl qtm-num text-ink">{brl(cf)}</p>
          <Link to="/custos-fixos" className="inline-flex items-center gap-1 mt-2 font-mono text-[11px] uppercase tracking-widest text-mute">
            Gerenciar custos fixos
            <span aria-hidden>→</span>
          </Link>
        </div>

        {cf <= 0 ? (
          <div className="border border-line py-8 px-4 text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-mute mb-4">
              Cadastre seus custos fixos primeiro
            </p>
            <Link to="/custos-fixos" className="btn-primary w-auto inline-block px-6">
              Adicionar custos fixos
            </Link>
          </div>
        ) : (
          <>
            {/* Slider de margem */}
            <div className="card">
              <div className="flex justify-between items-end mb-1">
                <span className="label mb-0">Margem (%)</span>
                <span className="qtm-num text-lg text-ink">{margem}%</span>
              </div>
              <input
                type="range" min="5" max="90" step="1" value={margem}
                onChange={(e) => setMargem(parseInt(e.target.value))}
                className="w-full accent-lime"
                aria-label="Margem de contribuição em porcentagem"
              />
              <p className="text-xs text-mute mt-2">
                Margem = o que sobra de cada venda <strong>depois</strong> de pagar
                ingredientes, embalagem e taxas. Arraste pra simular.
              </p>
            </div>

            {/* Resultado: faturamento de equilíbrio */}
            <div className="card bg-ink border-ink">
              <p className="font-mono text-[11px] uppercase tracking-widest text-bone/60 mb-1">
                Você precisa faturar
              </p>
              <p className="qtm-num text-3xl text-lime">
                {brl(breakeven)}
                <span className="text-base text-bone/60"> /mês</span>
              </p>
              <p className="text-sm text-bone/80 mt-2">
                só pra cobrir os custos fixos (lucro zero). Isso dá cerca de{' '}
                <span className="qtm-num text-bone">{brl(breakeven / 30)}</span> por dia.
              </p>
            </div>

            {/* Meta de lucro */}
            <div className="card">
              <label htmlFor="meta-lucro" className="label">Quero lucrar por mês (opcional)</label>
              <input
                id="meta-lucro" inputMode="decimal" value={lucro}
                onChange={(e) => setLucro(e.target.value)}
                placeholder="Ex.: 2000"
                className="input"
              />
              {lucroNum > 0 && (
                <p className="text-sm text-ink mt-2">
                  Pra lucrar <span className="qtm-num">{brl(lucroNum)}</span>, você precisa
                  faturar <span className="qtm-num font-semibold">{brl(comLucro)}</span>/mês.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
