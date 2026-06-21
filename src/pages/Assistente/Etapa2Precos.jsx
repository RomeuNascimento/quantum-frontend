import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listarIngredientes } from '../../api/ingredientes'
import { processarNotaFiscal, estimarPrecos, sugerirEmbalagem } from '../../api/ia'
import { brl, brl4 } from '../../utils/format'
import { normalizar, custoUnitario, quantidadeConsumida, converterEmbalagem } from './custo'

// ── Etapa 2 do Assistente — PREÇOS DOS INGREDIENTES ────────────────────────────
// Recebe a receita confirmada (Etapa 1). Descobre o que já tem preço no catálogo
// (silêncio) e o que falta. Coleta os faltantes por: foto da nota, estimativa da
// IA ou digitação. Nada é gravado aqui — fica em estado até o "salvar tudo" final.

function Bolha({ children }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 flex-shrink-0 bg-ink text-lime flex items-center justify-center font-mono text-sm font-bold">Q</div>
      <div className="flex-1 bg-receipt border border-line px-4 py-3">{children}</div>
    </div>
  )
}

const UNIDADES = ['g', 'kg', 'ml', 'L', 'unid']

export default function Etapa2Precos({ receita, onConcluir }) {
  const ingredientesQ = useQuery({
    queryKey: ['ingredientes'],
    queryFn: () => listarIngredientes().then((r) => r.data),
  })

  // Estado de preço por ingrediente da receita (chave = nome normalizado)
  // { preco, quantidade_embalagem, unidade, fonte } — fonte: nota|estimativa|manual
  const [precos, setPrecos] = useState({})
  const [processando, setProcessando] = useState(false)
  const [erro, setErro] = useState('')
  const [revisando, setRevisando] = useState(false)
  const [digitando, setDigitando] = useState(null) // chave em edição manual
  // Embalagens coletadas: { nome, preco, quantidade_embalagem, quantidade_usada }
  const [embalagens, setEmbalagens] = useState([])
  const [embConsultado, setEmbConsultado] = useState(false)
  const [embLoading, setEmbLoading] = useState(false)

  const sugerirEmb = async () => {
    setEmbLoading(true)
    try {
      const r = await sugerirEmbalagem(receita.nome || 'produto')
      const itens = (r.data.itens || []).map((e) => ({
        nome: e.nome,
        preco: e.preco,
        quantidade_embalagem: e.quantidade_embalagem || 1,
        quantidade_usada: e.quantidade_usada || 1,
      }))
      setEmbalagens((prev) => [...prev, ...itens])
    } catch (e) {
      setErro(e.message)
    } finally {
      setEmbConsultado(true); setEmbLoading(false)
    }
  }
  const removerEmb = (i) => setEmbalagens((prev) => prev.filter((_, idx) => idx !== i))

  const catalogo = ingredientesQ.data || []
  const achaNoCatalogo = (nome) =>
    catalogo.find((c) => normalizar(c.nome) === normalizar(nome)) || null

  // Classifica cada ingrediente: 'pronto' (já tem custo no catálogo / água) ou 'faltante'
  const itens = useMemo(() => {
    return (receita.ingredientes || []).map((ing) => {
      const cat = achaNoCatalogo(ing.nome)
      const chave = normalizar(ing.nome)
      const local = precos[chave]
      // Já resolvido pelo catálogo: tem custo > 0, ou é água (neutro, custo 0 de propósito)
      const ehAgua = chave === 'agua' || chave === 'água'
      const catCusto = cat?.custo_unitario_atual
      const prontoCatalogo = cat && (catCusto > 0 || ehAgua)

      let custoUnit = 0
      let fonte = null
      // Unidade de PREÇO (da fonte local, ou do catálogo): define se o consumo é peso ou contagem
      const unidadePreco = local?.unidade || cat?.unidade || 'g'
      if (local) {
        custoUnit = custoUnitario(local.preco, local.quantidade_embalagem, local.unidade, cat?.fator_correcao || 1)
        fonte = local.fonte
      } else if (prontoCatalogo) {
        custoUnit = catCusto || 0
        fonte = 'catalogo'
      }
      const resolvido = Boolean(local) || prontoCatalogo
      // Quando é por unidade (ovo), consumo = contagem ("3 ovos" → 3); senão, peso em g/ml
      const qtdConsumida = quantidadeConsumida({
        unidadePreco,
        quantidade_g: ing.quantidade_g,
        unidade_original: ing.unidade_original,
      })
      const porUnidade = unidadePreco === 'unid'
      return {
        chave,
        nome: ing.nome,
        quantidade_g: ing.quantidade_g,
        ingredienteId: cat?.id || null,
        catUnidade: cat?.unidade || null,
        qtdConsumida,
        unidadePreco,
        porUnidade,
        // rótulo da quantidade: "3 un" (contagem) ou "150g" (peso)
        rotuloQtd: porUnidade ? `${qtdConsumida} un` : `${ing.quantidade_g}g`,
        // rótulo do custo unitário: "/un" ou "/g" (g/ml já está na base)
        rotuloCustoUnit: porUnidade ? '/un' : `/${unidadePreco === 'ml' || unidadePreco === 'L' ? 'ml' : 'g'}`,
        resolvido,
        fonte,
        custoUnit,
        custoReceita: custoUnit * qtdConsumida,
        local,
      }
    })
  }, [receita, precos, catalogo])

  const faltantes = itens.filter((i) => !i.resolvido)
  const prontos = itens.filter((i) => i.resolvido)
  const totalReceita = itens.reduce((s, i) => s + i.custoReceita, 0)

  // Monta os ingredientes no formato do endpoint /assistente/salvar.
  const construirPayload = () => itens.map((i) => {
    const base = { nome: i.nome, quantidade: i.qtdConsumida }
    // Já precificado pelo catálogo: só referencia, sem novo preço
    if (i.fonte === 'catalogo') return { ...base, ingrediente_id: i.ingredienteId }
    // Preço coletado nesta sessão (nota/estimativa/manual)
    if (i.local) {
      if (i.ingredienteId) {
        // Ingrediente existente: grava o preço na unidade DELE (converte se preciso)
        return {
          ...base,
          ingrediente_id: i.ingredienteId,
          preco: i.local.preco,
          quantidade_embalagem: converterEmbalagem(i.local.quantidade_embalagem, i.local.unidade, i.catUnidade),
        }
      }
      // Ingrediente novo: cria com a unidade coletada
      return {
        ...base,
        unidade: i.local.unidade,
        preco: i.local.preco,
        quantidade_embalagem: i.local.quantidade_embalagem,
      }
    }
    // Sem preço (não deveria acontecer aqui) — referencia/cria sem preço
    return i.ingredienteId ? { ...base, ingrediente_id: i.ingredienteId } : base
  })

  // Aplica preços recebidos (nota/estimativa) casando por nome normalizado
  const aplicar = (lista, fonte) => {
    setPrecos((prev) => {
      const novo = { ...prev }
      for (const it of lista) {
        const chave = normalizar(it.nome)
        // Só preenche faltantes (não sobrescreve o que já foi resolvido)
        const alvo = faltantes.find((f) => f.chave === chave)
        if (!alvo) continue
        novo[chave] = {
          preco: parseFloat(it.preco_unitario ?? it.preco) || 0,
          quantidade_embalagem: parseFloat(it.peso_embalagem_g ?? it.quantidade_embalagem) || 1,
          unidade: UNIDADES.includes(it.unidade) ? it.unidade : 'g',
          fonte,
        }
      }
      return novo
    })
  }

  const enviarNota = async (file) => {
    if (!file) return
    setErro(''); setProcessando(true)
    try {
      const r = await processarNotaFiscal(file)
      aplicar(r.data.itens || [], 'nota')
    } catch (e) {
      setErro(e.message)
    } finally {
      setProcessando(false)
    }
  }

  const estimarFaltantes = async () => {
    if (faltantes.length === 0) return
    setErro(''); setProcessando(true)
    try {
      const r = await estimarPrecos(faltantes.map((f) => f.nome))
      aplicar(r.data.itens || [], 'estimativa')
    } catch (e) {
      setErro(e.message)
    } finally {
      setProcessando(false)
    }
  }

  const salvarManual = (chave, dados) => {
    setPrecos((prev) => ({
      ...prev,
      [chave]: {
        preco: parseFloat(dados.preco) || 0,
        quantidade_embalagem: parseFloat(dados.quantidade_embalagem) || 1,
        unidade: dados.unidade,
        fonte: 'manual',
      },
    }))
    setDigitando(null)
  }

  // ── REVISÃO (custos) ───────────────────────────────────────────────────────
  if (revisando) {
    const porPorcao = receita.rendimento_g ? totalReceita / (receita.rendimento_g / 100) : 0
    return (
      <div className="px-4 pt-5 pb-28 space-y-4">
        <Bolha>
          <p className="font-sans text-sm text-ink">
            Fechei o custo de matéria-prima da receita 👇 Os marcados como{' '}
            <span className="text-rust font-medium">estimativa</span> valem conferir depois.
          </p>
        </Bolha>

        <div className="border border-ink bg-bone">
          {itens.map((i) => (
            <div key={i.chave} className="flex items-center gap-2 px-3 py-2.5 border-b border-line last:border-b-0">
              <span className="font-sans text-sm text-ink flex-1 truncate">{i.nome}</span>
              {i.fonte === 'estimativa' && (
                <span className="font-mono text-[9px] uppercase tracking-wide text-rust border border-rust px-1">est</span>
              )}
              <span className="qtm-num text-xs text-mute w-12 text-right">{i.rotuloQtd}</span>
              <span className="qtm-num text-sm text-ink w-16 text-right">{brl(i.custoReceita)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-3 py-3 bg-ink text-bone">
            <span className="font-mono text-xs uppercase tracking-widest">Custo da receita</span>
            <span className="qtm-num text-base font-bold text-lime">{brl(totalReceita)}</span>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-bone border-t border-line px-4 py-3 z-30">
          <div className="max-w-xl mx-auto flex gap-2">
            <button onClick={() => setRevisando(false)} className="btn-ghost flex-1">Voltar</button>
            <button onClick={() => onConcluir({ totalReceita, ingredientesPayload: construirPayload(), embalagens })} className="btn-primary flex-1">
              Confirmar preços →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── COLETA ─────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 pt-5 pb-28 space-y-4">
      <Bolha>
        {ingredientesQ.isLoading ? (
          <p className="font-sans text-sm text-ink">Conferindo o que você já tem cadastrado…</p>
        ) : faltantes.length === 0 ? (
          <p className="font-sans text-sm text-ink">
            Boa notícia: <strong>já tenho o preço de todos</strong> os ingredientes! Pode seguir. ✅
          </p>
        ) : (
          <>
            <p className="font-sans text-sm text-ink">
              {prontos.length > 0 && <>Já sei o preço de <strong>{prontos.length}</strong>. </>}
              Faltam <strong>{faltantes.length}</strong>: {faltantes.map((f) => f.nome).join(', ')}.
            </p>
            <p className="font-sans text-sm text-ink mt-2">
              Manda a <strong>foto da nota</strong> que eu pego tudo de uma vez. 📸
            </p>
          </>
        )}
      </Bolha>

      {erro && (
        <div className="bg-rust/10 border border-rust px-3 py-2">
          <p className="font-sans text-sm text-rust">{erro}</p>
        </div>
      )}

      {processando && (
        <Bolha>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-lime/30 border-t-lime rounded-full animate-spin flex-shrink-0" />
            <p className="font-sans text-sm text-ink">Trabalhando nos preços…</p>
          </div>
        </Bolha>
      )}

      {faltantes.length > 0 && !processando && (
        <>
          {/* CTA: foto da nota */}
          <label className="block w-full bg-ink text-bone border border-ink px-4 py-4 active:opacity-80 cursor-pointer">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0 text-lime" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
                <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-mono text-xs font-bold uppercase tracking-widest text-lime">Foto da nota fiscal</p>
                <p className="font-mono text-[10px] text-bone/70">Pego os preços de vários de uma vez</p>
              </div>
            </div>
            <input type="file" accept="image/*,application/pdf" className="hidden"
              onChange={(e) => enviarNota(e.target.files[0])} />
          </label>

          {/* Estimar tudo */}
          <button onClick={estimarFaltantes}
            className="w-full border border-ink bg-bone px-4 py-3 active:bg-ink active:text-bone group flex items-center gap-3">
            <span className="text-lg">🤖</span>
            <div className="flex-1 text-left">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-ink group-active:text-bone">
                Não tenho as notas — estime pra mim
              </p>
              <p className="font-mono text-[10px] text-mute group-active:text-bone/70">
                A IA sugere preço de mercado · você confirma
              </p>
            </div>
          </button>
        </>
      )}

      {/* Lista de ingredientes */}
      {itens.length > 0 && (
        <div className="border border-line">
          {itens.map((i) => (
            <div key={i.chave} className="border-b border-line last:border-b-0">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <span className={`w-2 h-2 flex-shrink-0 ${i.resolvido ? 'bg-lime' : 'bg-rust'}`} />
                <span className="font-sans text-sm text-ink flex-1 truncate">{i.nome}</span>
                {i.resolvido ? (
                  <>
                    {i.fonte === 'estimativa' && (
                      <span className="font-mono text-[9px] uppercase tracking-wide text-rust border border-rust px-1">est</span>
                    )}
                    <span className="qtm-num text-xs text-mute">{brl4(i.custoUnit)}{i.rotuloCustoUnit}</span>
                  </>
                ) : (
                  <div className="flex gap-1">
                    <button onClick={() => setDigitando(digitando === i.chave ? null : i.chave)}
                      className="font-mono text-[10px] uppercase tracking-wide border border-ink px-2 py-1 active:bg-ink active:text-bone">
                      Digitar
                    </button>
                  </div>
                )}
              </div>

              {/* Edição manual inline */}
              {digitando === i.chave && (
                <ManualForm unidadePadrao={i.unidadeCatalogo}
                  onSalvar={(d) => salvarManual(i.chave, d)}
                  onCancelar={() => setDigitando(null)} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Embalagem (opcional) — IA sugere por produto */}
      {faltantes.length === 0 && (
        <div className="border border-line p-3 space-y-2">
          <p className="label mb-0">Embalagem (opcional)</p>
          {embalagens.map((e, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-lime flex-shrink-0" />
              <span className="font-sans text-sm text-ink flex-1 truncate">{e.nome}</span>
              <span className="qtm-num text-xs text-mute">{brl4(e.preco / e.quantidade_embalagem * e.quantidade_usada)}/un</span>
              <button onClick={() => removerEmb(i)} aria-label="Remover" className="text-mute px-1">✕</button>
            </div>
          ))}
          {embLoading ? (
            <p className="font-mono text-xs text-mute">Pensando na embalagem…</p>
          ) : !embConsultado ? (
            <button onClick={sugerirEmb}
              className="w-full border border-ink bg-bone px-3 py-2 active:bg-ink active:text-bone font-mono text-[11px] uppercase tracking-widest">
              🤖 Esse produto vai embalado? Sugerir
            </button>
          ) : embalagens.length === 0 ? (
            <p className="font-mono text-[11px] text-mute">Sem embalagem (você pode adicionar depois).</p>
          ) : null}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-bone border-t border-line px-4 py-3 z-30">
        <button onClick={() => setRevisando(true)} disabled={faltantes.length > 0}
          className="btn-primary w-full max-w-xl mx-auto block disabled:opacity-40">
          {faltantes.length > 0 ? `Faltam ${faltantes.length} preço(s)` : 'Ver custo da receita →'}
        </button>
      </div>
    </div>
  )
}

function ManualForm({ unidadePadrao, onSalvar, onCancelar }) {
  const [preco, setPreco] = useState('')
  const [qtd, setQtd] = useState('')
  const [unidade, setUnidade] = useState(unidadePadrao)
  return (
    <div className="px-3 pb-3 pt-1 bg-receipt border-t border-line space-y-2">
      <p className="font-mono text-[10px] text-mute">Quanto custou a embalagem que você comprou?</p>
      <div className="flex gap-2">
        <div className="flex-1">
          <p className="label">Preço R$</p>
          <input type="number" inputMode="decimal" className="input w-full text-sm" value={preco}
            onChange={(e) => setPreco(e.target.value)} placeholder="5,99" />
        </div>
        <div className="w-20">
          <p className="label">Qtd</p>
          <input type="number" inputMode="decimal" className="input w-full text-sm" value={qtd}
            onChange={(e) => setQtd(e.target.value)} placeholder="1" />
        </div>
        <div className="w-20">
          <p className="label">Unid.</p>
          <select className="input w-full text-sm" value={unidade} onChange={(e) => setUnidade(e.target.value)}>
            {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancelar} className="btn-ghost flex-1 py-2">Cancelar</button>
        <button onClick={() => onSalvar({ preco, quantidade_embalagem: qtd, unidade })}
          disabled={!preco || !qtd} className="btn-primary flex-1 py-2 disabled:opacity-40">Salvar</button>
      </div>
    </div>
  )
}
