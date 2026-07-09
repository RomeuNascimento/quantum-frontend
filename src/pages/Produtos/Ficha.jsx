import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import CompartilharWhatsApp from '../../components/CompartilharWhatsApp'
import { detalharProduto } from '../../api/produtos'

import { brl } from '../../utils/format'

function Tabela({ titulo, colunas, linhas }) {
  if (linhas.length === 0) return null
  return (
    <>
      <p className="label mb-2">{titulo}</p>
      <table className="w-full mb-5">
        <thead>
          <tr className="border-b border-outline-strong">
            <th className="text-left font-mono text-[9px] uppercase tracking-widest text-on-surface-dim py-1">{colunas[0]}</th>
            <th className="text-right font-mono text-[9px] uppercase tracking-widest text-on-surface-dim py-1">{colunas[1]}</th>
            <th className="text-right font-mono text-[9px] uppercase tracking-widest text-on-surface-dim py-1">Custo</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.id} className="border-b border-outline">
              <td className="text-sm text-on-surface py-1.5">{l.nome}</td>
              <td className="qtm-num text-sm text-on-surface text-right py-1.5">{l.qtd}</td>
              <td className="qtm-num text-sm text-on-surface-dim text-right py-1.5">{brl(l.custo)}</td>
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
        <div className="px-4 pt-4">
          <div className="bg-danger-bg text-on-danger-bg rounded-xl px-4 py-3">
            <p className="font-sans text-sm">{erro}</p>
          </div>
        </div>
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

  const linhaTabela = (titulo, itens, fmtQtd) =>
    itens.length ? [`*${titulo}:*`, ...itens.map((x) => `• ${x.nome}: ${fmtQtd(x)}`), ''] : []

  const textoFicha = [
    `*Ficha técnica — ${produto.nome}*`,
    '',
    ...linhaTabela('Preparações', produto.preparacoes, (p) => `${p.quantidade}g`),
    ...linhaTabela('Ingredientes', produto.ingredientes_avulsos, (i) => `${i.quantidade}g`),
    ...linhaTabela('Embalagens', produto.embalagens, (e) => `${e.quantidade}`),
    `Custo total: ${brl(produto.custo_total)}`,
  ].join('\n')

  return (
    <Layout title="Ficha técnica" onBack={() => navigate(-1)}>
      <div className="px-4 pt-4 max-w-lg mx-auto">
        {/* Cabeçalho da ficha */}
        <div className="mb-4">
          <p className="eyebrow">Ficha técnica — Produto</p>
          <h2 className="title-serif text-2xl">{produto.nome}</h2>
        </div>

        <div className="card mb-4">
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
              <ol>
                {produto.mo_montagem.map((m, idx) => (
                  <li key={m.id} className="flex items-baseline gap-3 border-b border-outline py-1.5 last:border-b-0">
                    <span className="qtm-num text-xs text-on-surface-dim flex-shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="text-sm text-on-surface flex-1">{m.descricao}</span>
                    <span className="qtm-num text-xs text-on-surface-dim flex-shrink-0">{m.tempo_min} min</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>

        {/* Totais */}
        <div className="card mb-6">
          <div className="flex justify-between py-0.5">
            <span className="label mb-0">Matéria-prima</span>
            <span className="qtm-num text-sm text-on-surface">{brl(produto.custo_mp_total)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="label mb-0">Mão de obra</span>
            <span className="qtm-num text-sm text-on-surface">{brl(produto.custo_mo_total)}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="label mb-0">Embalagens</span>
            <span className="qtm-num text-sm text-on-surface">{brl(produto.custo_embalagens_total)}</span>
          </div>
          <div className="flex justify-between py-1 mt-1 border-t border-outline-strong">
            <span className="label mb-0 text-primary">Custo total</span>
            <span className="qtm-num text-base font-bold text-primary">{brl(produto.custo_total)}</span>
          </div>
        </div>

        <CompartilharWhatsApp texto={textoFicha} label="Enviar ficha por WhatsApp" className="mb-3" />
        <button onClick={() => window.print()} className="btn-ghost w-full mb-8 print:hidden">
          Imprimir / Salvar PDF
        </button>
      </div>
    </Layout>
  )
}
