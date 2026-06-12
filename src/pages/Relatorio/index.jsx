import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import MargemBadge from '../../components/MargemBadge'
import { relatorioMargem } from '../../api/precificacao'

import { brl } from '../../utils/format'

function ResumoMargens({ produtos }) {
  let saudavel = 0, atencao = 0, revisar = 0
  produtos.forEach((p) => p.canais.forEach((c) => {
    if (c.margem_real_pct >= 30) saudavel++
    else if (c.margem_real_pct >= 10) atencao++
    else revisar++
  }))
  const total = saudavel + atencao + revisar
  if (total === 0) return null
  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      <div className="card px-3 py-2 text-center">
        <p className="qtm-num text-xl font-bold text-ink">{saudavel}</p>
        <p className="font-mono text-[9px] uppercase tracking-widest text-mute">Saudável</p>
      </div>
      <div className="card px-3 py-2 text-center">
        <p className="qtm-num text-xl font-bold text-ink">{atencao}</p>
        <p className="font-mono text-[9px] uppercase tracking-widest text-mute">Atenção</p>
      </div>
      <div className={`px-3 py-2 text-center border ${revisar > 0 ? 'bg-rust text-bone border-rust' : 'card'}`}>
        <p className={`qtm-num text-xl font-bold ${revisar > 0 ? 'text-bone' : 'text-ink'}`}>{revisar}</p>
        <p className={`font-mono text-[9px] uppercase tracking-widest ${revisar > 0 ? 'text-bone/80' : 'text-mute'}`}>Revisar</p>
      </div>
    </div>
  )
}

export default function Relatorio() {
  const navigate = useNavigate()
  const [erro, setErro] = useState('')

  const { data: produtos = [], isLoading: loading, isError, error } = useQuery({
    queryKey: ['relatorio-margem'],
    queryFn: () => relatorioMargem().then((r) => r.data.produtos),
  })

  useEffect(() => { if (error) setErro(error.message) }, [error])

  const semPrecificacao = produtos.filter((p) => p.canais.length === 0)
  const comPrecificacao = produtos.filter((p) => p.canais.length > 0)

  return (
    <Layout title="Relatório de margem" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4">
        {erro && (
          <div className="bg-rust/10 border border-rust px-3 py-2 mb-4 flex items-center justify-between gap-2">
            <p className="font-mono text-xs text-rust flex-1">{erro}</p>
            <button onClick={() => setErro('')} className="font-mono text-xs text-rust">✕</button>
          </div>
        )}
        {loading ? <LoadingSpinner /> : isError ? null : produtos.length === 0 ? (
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
                <div className="flex items-center justify-between mb-1">
                  <Link to={`/produtos/${p.produto_id}`} className="font-sans font-semibold text-ink text-sm">
                    {p.produto_nome}
                  </Link>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mute">
                    Custo <span className="qtm-num text-ink">{brl(p.custo_total)}</span>
                  </span>
                </div>
                <div>
                  {p.canais.map((c) => (
                    <div key={c.canal_id} className="flex items-center justify-between border-b border-line py-2 last:border-b-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink truncate">{c.canal_nome}</p>
                        <p className="qtm-num text-[11px] text-mute">
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
                <p className="label mb-2">Sem precificação</p>
                {semPrecificacao.map((p) => (
                  <Link
                    key={p.produto_id}
                    to="/precificacao"
                    className="flex items-center justify-between border-b border-line py-3 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{p.produto_nome}</p>
                      <p className="qtm-num text-[11px] text-mute">Custo {brl(p.custo_total)}</p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-mute">Precificar →</span>
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
