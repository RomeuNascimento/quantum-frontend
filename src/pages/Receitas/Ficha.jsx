import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { detalharReceita } from '../../api/receitas'

const brl = (v) => `R$ ${Number(v || 0).toFixed(2)}`

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
        <p className="font-mono text-xs text-rust px-4 pt-4">{erro}</p>
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

  return (
    <Layout title="Ficha técnica" onBack={() => navigate(-1)}>
      <div className="px-4 pt-4 max-w-lg mx-auto">
        {/* Cabeçalho da ficha */}
        <div className="border-b-2 border-ink pb-3 mb-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-mute">Ficha técnica</p>
          <h2 className="text-xl font-bold text-ink font-sans">{receita.nome}</h2>
          <div className="flex gap-4 mt-1">
            {receita.tipo && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-mute">{receita.tipo}</span>
            )}
            <span className="font-mono text-[10px] uppercase tracking-widest text-mute">
              Rendimento: <span className="qtm-num text-ink">{receita.rendimento_g}g</span>
            </span>
          </div>
        </div>

        {/* Ingredientes */}
        <p className="label mb-2">Ingredientes</p>
        <table className="w-full mb-5">
          <thead>
            <tr className="border-b border-ink">
              <th className="text-left font-mono text-[9px] uppercase tracking-widest text-mute py-1">Ingrediente</th>
              <th className="text-right font-mono text-[9px] uppercase tracking-widest text-mute py-1">Qtd</th>
              <th className="text-right font-mono text-[9px] uppercase tracking-widest text-mute py-1">Custo</th>
            </tr>
          </thead>
          <tbody>
            {receita.ingredientes.map((i) => (
              <tr key={i.id} className="border-b border-line">
                <td className="text-sm text-ink py-1.5">{i.ingrediente_nome}</td>
                <td className="qtm-num text-sm text-ink text-right py-1.5">{i.quantidade_g}g</td>
                <td className="qtm-num text-sm text-mute text-right py-1.5">{brl(i.custo)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Etapas */}
        {receita.etapas_mo.length > 0 && (
          <>
            <p className="label mb-2">Modo de preparo / etapas</p>
            <ol className="mb-5">
              {receita.etapas_mo.map((e, idx) => (
                <li key={e.id} className="flex items-baseline gap-3 border-b border-line py-1.5 last:border-b-0">
                  <span className="qtm-num text-xs text-mute flex-shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="text-sm text-ink flex-1">{e.descricao}</span>
                  <span className="qtm-num text-xs text-mute flex-shrink-0">{e.tempo_min} min</span>
                </li>
              ))}
            </ol>
          </>
        )}

        {/* Totais */}
        <div className="border-t-2 border-ink pt-3 mb-6">
          <div className="flex justify-between py-0.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-mute">Custo matéria-prima</span>
            <span className="qtm-num text-sm text-ink">{brl(receita.custo_mp_total)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-mute">Custo mão de obra ({tempoTotal} min)</span>
            <span className="qtm-num text-sm text-ink">{brl(receita.custo_mo_total)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink font-bold">Custo total</span>
            <span className="qtm-num text-sm font-bold text-ink">{brl(receita.custo_total)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-mute">Custo por grama</span>
            <span className="qtm-num text-sm text-ink">{brl(receita.custo_por_grama)}</span>
          </div>
        </div>

        {/* Botão imprimir/PDF — some na impressão */}
        <button onClick={() => window.print()} className="btn-primary w-full mb-8 print:hidden">
          Imprimir / Salvar PDF
        </button>
      </div>
    </Layout>
  )
}
