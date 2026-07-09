import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import CompartilharWhatsApp from '../../components/CompartilharWhatsApp'
import { detalharReceita } from '../../api/receitas'

import { brl } from '../../utils/format'

export default function ReceitaFicha() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [receita, setReceita] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    detalharReceita(id)
      .then((r) => setReceita(r.data))
      .catch((e) => setErro(e.message))
  }, [id])

  if (erro) {
    return (
      <Layout title="Ficha técnica" onBack={() => navigate(-1)}>
        <div className="px-4 pt-4">
          <div className="bg-danger-bg text-on-danger-bg rounded-xl px-4 py-3">
            <p className="font-sans text-sm">{erro}</p>
          </div>
        </div>
      </Layout>
    )
  }
  if (!receita) {
    return (
      <Layout title="Ficha técnica" onBack={() => navigate(-1)}>
        <LoadingSpinner />
      </Layout>
    )
  }

  const tempoTotal = receita.etapas_mo.reduce((s, e) => s + e.tempo_min, 0)

  const textoFicha = [
    `*Ficha técnica — ${receita.nome}*`,
    `Rendimento: ${receita.rendimento_g}g${receita.tipo ? ` · ${receita.tipo}` : ''}`,
    '',
    '*Ingredientes:*',
    ...receita.ingredientes.map((i) => `• ${i.ingrediente_nome}: ${i.quantidade_g}g`),
    ...(receita.etapas_mo.length > 0 ? [
      '',
      '*Modo de preparo:*',
      ...receita.etapas_mo.map((e, idx) => `${idx + 1}. ${e.descricao}${e.tempo_min ? ` (${e.tempo_min} min)` : ''}`),
    ] : []),
    '',
    `Custo total: ${brl(receita.custo_total)}`,
  ].join('\n')

  return (
    <Layout title="Ficha técnica" onBack={() => navigate(-1)}>
      <div className="px-4 pt-4 max-w-lg mx-auto">
        {/* Cabeçalho da ficha */}
        <div className="mb-4">
          <p className="eyebrow">Ficha técnica</p>
          <h2 className="title-serif text-2xl">{receita.nome}</h2>
          <div className="flex gap-4 mt-1">
            {receita.tipo && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-dim">{receita.tipo}</span>
            )}
            <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-dim">
              Rendimento: <span className="qtm-num text-on-surface">{receita.rendimento_g}g</span>
            </span>
          </div>
        </div>

        {/* Ingredientes */}
        <div className="card mb-4">
          <p className="label mb-2">Ingredientes</p>
          <table className="w-full mb-5">
            <thead>
              <tr className="border-b border-outline-strong">
                <th className="text-left font-mono text-[9px] uppercase tracking-widest text-on-surface-dim py-1">Ingrediente</th>
                <th className="text-right font-mono text-[9px] uppercase tracking-widest text-on-surface-dim py-1">Qtd</th>
                <th className="text-right font-mono text-[9px] uppercase tracking-widest text-on-surface-dim py-1">Custo</th>
              </tr>
            </thead>
            <tbody>
              {receita.ingredientes.map((i) => (
                <tr key={i.id} className="border-b border-outline">
                  <td className="text-sm text-on-surface py-1.5">{i.ingrediente_nome}</td>
                  <td className="qtm-num text-sm text-on-surface text-right py-1.5">{i.quantidade_g}g</td>
                  <td className="qtm-num text-sm text-on-surface-dim text-right py-1.5">{brl(i.custo)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Etapas */}
          {receita.etapas_mo.length > 0 && (
            <>
              <p className="label mb-2">Modo de preparo / etapas</p>
              <ol>
                {receita.etapas_mo.map((e, idx) => (
                  <li key={e.id} className="flex items-baseline gap-3 border-b border-outline py-1.5 last:border-b-0">
                    <span className="qtm-num text-xs text-on-surface-dim flex-shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="text-sm text-on-surface flex-1">{e.descricao}</span>
                    <span className="qtm-num text-xs text-on-surface-dim flex-shrink-0">{e.tempo_min} min</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>

        {/* Totais */}
        <div className="card mb-6">
          <div className="flex justify-between py-0.5">
            <span className="label mb-0">Custo matéria-prima</span>
            <span className="qtm-num text-sm text-on-surface">{brl(receita.custo_mp_total)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="label mb-0">Custo mão de obra ({tempoTotal} min)</span>
            <span className="qtm-num text-sm text-on-surface">{brl(receita.custo_mo_total)}</span>
          </div>
          <div className="flex justify-between py-1 mt-1 border-t border-outline-strong">
            <span className="label mb-0 text-primary">Custo total</span>
            <span className="qtm-num text-base font-bold text-primary">{brl(receita.custo_total)}</span>
          </div>
          <div className="flex justify-between py-0.5 mt-1">
            <span className="label mb-0">Custo por grama</span>
            <span className="qtm-num text-sm text-on-surface">{brl(receita.custo_por_grama)}</span>
          </div>
        </div>

        {/* Ações — somem na impressão */}
        <CompartilharWhatsApp texto={textoFicha} label="Enviar ficha por WhatsApp" className="mb-3" />
        <button onClick={() => window.print()} className="btn-ghost w-full mb-8 print:hidden">
          Imprimir / Salvar PDF
        </button>
      </div>
    </Layout>
  )
}
