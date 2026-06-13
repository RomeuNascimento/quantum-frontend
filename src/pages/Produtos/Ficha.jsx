import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { detalharProduto } from '../../api/produtos'

import { brl } from '../../utils/format'

function Tabela({ titulo, colunas, linhas }) {
  if (linhas.length === 0) return null
  return (
    <>
      <p className="label mb-2">{titulo}</p>
      <table className="w-full mb-5">
        <thead>
          <tr className="border-b border-ink">
            <th className="text-left font-mono text-[9px] uppercase tracking-widest text-mute py-1">{colunas[0]}</th>
            <th className="text-right font-mono text-[9px] uppercase tracking-widest text-mute py-1">{colunas[1]}</th>
            <th className="text-right font-mono text-[9px] uppercase tracking-widest text-mute py-1">Custo</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.id} className="border-b border-line">
              <td className="text-sm text-ink py-1.5">{l.nome}</td>
              <td className="qtm-num text-sm text-ink text-right py-1.5">{l.qtd}</td>
              <td className="qtm-num text-sm text-mute text-right py-1.5">{brl(l.custo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default function ProdutoFicha() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [produto, setProduto] = useState(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    detalharProduto(id)
      .then((r) => setProduto(r.data))
      .catch((e) => setErro(e.message))
  }, [id])

  if (erro) {
    return (
      <Layout title="Ficha técnica" onBack={() => navigate(-1)}>
        <p className="font-sans text-sm text-rust px-4 pt-4">{erro}</p>
      </Layout>
    )
  }
  if (!produto) {
    return (
      <Layout title="Ficha técnica" onBack={() => navigate(-1)}>
        <LoadingSpinner />
      </Layout>
    )
  }

  return (
    <Layout title="Ficha técnica" onBack={() => navigate(-1)}>
      <div className="px-4 pt-4 max-w-lg mx-auto">
        {/* Cabeçalho da ficha */}
        <div className="border-b-2 border-ink pb-3 mb-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-mute">Ficha técnica — Produto</p>
          <h2 className="text-xl font-bold text-ink font-sans">{produto.nome}</h2>
        </div>

        <Tabela
          titulo="Preparações"
          colunas={['Receita', 'Qtd']}
          linhas={produto.preparacoes.map((p) => ({ id: `p${p.id}`, nome: p.nome, qtd: `${p.quantidade}g`, custo: p.custo }))}
        />
        <Tabela
          titulo="Ingredientes avulsos"
          colunas={['Ingrediente', 'Qtd']}
          linhas={produto.ingredientes_avulsos.map((i) => ({ id: `i${i.id}`, nome: i.nome, qtd: `${i.quantidade}g`, custo: i.custo }))}
        />
        <Tabela
          titulo="Embalagens"
          colunas={['Embalagem', 'Qtd']}
          linhas={produto.embalagens.map((e) => ({ id: `e${e.id}`, nome: e.nome, qtd: e.quantidade, custo: e.custo }))}
        />

        {/* Montagem */}
        {produto.mo_montagem.length > 0 && (
          <>
            <p className="label mb-2">Montagem</p>
            <ol className="mb-5">
              {produto.mo_montagem.map((m, idx) => (
                <li key={m.id} className="flex items-baseline gap-3 border-b border-line py-1.5 last:border-b-0">
                  <span className="qtm-num text-xs text-mute flex-shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="text-sm text-ink flex-1">{m.descricao}</span>
                  <span className="qtm-num text-xs text-mute flex-shrink-0">{m.tempo_min} min</span>
                </li>
              ))}
            </ol>
          </>
        )}

        {/* Totais */}
        <div className="border-t-2 border-ink pt-3 mb-6">
          <div className="flex justify-between py-0.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-mute">Matéria-prima</span>
            <span className="qtm-num text-sm text-ink">{brl(produto.custo_mp_total)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-mute">Mão de obra</span>
            <span className="qtm-num text-sm text-ink">{brl(produto.custo_mo_total)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-mute">Embalagens</span>
            <span className="qtm-num text-sm text-ink">{brl(produto.custo_embalagens_total)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink font-bold">Custo total</span>
            <span className="qtm-num text-sm font-bold text-ink">{brl(produto.custo_total)}</span>
          </div>
        </div>

        <button onClick={() => window.print()} className="btn-primary w-full mb-8 print:hidden">
          Imprimir / Salvar PDF
        </button>
      </div>
    </Layout>
  )
}
