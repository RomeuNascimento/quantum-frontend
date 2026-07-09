import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import LoadError from '../../components/LoadError'
import MargemBadge from '../../components/MargemBadge'
import { relatorioMargem } from '../../api/precificacao'

import { brl } from '../../utils/format'

function ResumoMargens({ produtos }) {
  let saudavel = 0, atencao = 0, revisar = 0
  let somaMargem = 0, totalCanais = 0
  produtos.forEach((p) => p.canais.forEach((c) => {
    if (c.margem_real_pct >= 30) saudavel++
    else if (c.margem_real_pct >= 10) atencao++
    else revisar++
    somaMargem += c.margem_real_pct
    totalCanais++
  }))
  if (totalCanais === 0) return null
  const media = somaMargem / totalCanais

  return (
    <div className="card mb-5">
      <p className="label mb-1">Margem média geral</p>
      <p className="qtm-num text-4xl font-bold text-primary">{media.toFixed(0)}%</p>
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-outline">
        <div>
          <p className="qtm-num text-2xl font-bold text-positive">{saudavel}</p>
          <p className="label mt-0.5">Saudáveis</p>
        </div>
        <div>
          <p className="qtm-num text-2xl font-bold text-on-surface">{atencao}</p>
          <p className="label mt-0.5">Atenção</p>
        </div>
        <div>
          <p className="qtm-num text-2xl font-bold text-danger">{revisar}</p>
          <p className="label mt-0.5">Revisar</p>
        </div>
      </div>
    </div>
  )
}

export default function Relatorio() {
  const navigate = useNavigate()
  const [erro, setErro] = useState('')

  const { data: produtos = [], isLoading: loading, isError, error, refetch } = useQuery({
    queryKey: ['relatorio-margem'],
    queryFn: () => relatorioMargem().then((r) => r.data.produtos),
  })

  useEffect(() => { if (error) setErro(error.message) }, [error])

  const semPrecificacao = produtos.filter((p) => p.canais.length === 0)
  const comPrecificacao = produtos.filter((p) => p.canais.length > 0)

  return (
    <Layout title="Relatório de margem" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4">
        <div className="mb-5">
          <p className="eyebrow">Análise</p>
          <h1 className="title-serif text-3xl">Relatório de Margem</h1>
          <p className="text-sm text-on-surface-dim mt-1">
            Veja a margem real de cada produto por canal de venda.
          </p>
        </div>

        {erro && (
          <div className="bg-danger-bg text-on-danger-bg rounded-xl px-3 py-2 mb-4 flex items-center justify-between gap-2">
            <p className="font-sans text-sm flex-1">{erro}</p>
            <button onClick={() => setErro('')} className="font-mono text-xs">✕</button>
          </div>
        )}
        {loading ? <LoadingSpinner /> : isError ? (
          <LoadError onRetry={() => { setErro(''); refetch() }} />
        ) : produtos.length === 0 ? (
          <EmptyState
            title="Nenhum produto cadastrado"
            description="Cadastre produtos e precifique-os para ver o relatório de margem."
            action={<Link to="/produtos/novo" className="btn-primary inline-block">+ Produto</Link>}
          />
        ) : (
          <>
            <ResumoMargens produtos={comPrecificacao} />

            {comPrecificacao.map((p) => (
              <div key={p.produto_id} className="card mb-3">
                <div className="flex items-center justify-between mb-2">
                  <Link to={`/produtos/${p.produto_id}`} className="font-serif font-bold text-primary text-base">
                    {p.produto_nome}
                  </Link>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-dim">
                    Custo <span className="qtm-num text-on-surface">{brl(p.custo_total)}</span>
                  </span>
                </div>
                <div>
                  {p.canais.map((c) => (
                    <div key={c.canal_id} className="flex items-center justify-between border-b border-outline py-2 last:border-b-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-on-surface truncate">{c.canal_nome}</p>
                        <p className="qtm-num text-[11px] text-on-surface-dim">
                          {brl(c.preco_praticado)}
                          {!c.preco_final && (
                            <span className="font-mono text-[9px] uppercase tracking-widest"> · sugerido</span>
                          )}
                          {' · lucro '}{brl(c.lucro_unitario)}
                        </p>
                      </div>
                      <MargemBadge margem={c.margem_real_pct} />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {semPrecificacao.length > 0 && (
              <div className="mt-5">
                <p className="label mb-2">Ainda sem preço</p>
                {semPrecificacao.map((p) => (
                  <Link
                    key={p.produto_id}
                    to="/precificacao"
                    className="flex items-center justify-between border-b border-outline py-3 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-on-surface">{p.produto_nome}</p>
                      <p className="qtm-num text-[11px] text-on-surface-dim">Custo {brl(p.custo_total)}</p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-dim">Precificar →</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
