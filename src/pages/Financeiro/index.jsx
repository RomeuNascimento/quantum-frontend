import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import ConfirmDialog from '../../components/ConfirmDialog'
import { brl, parseDecimal } from '../../utils/format'
import {
  criarLancamento,
  deletarLancamento,
  interpretarLancamento,
  lerComprovante,
  listarLancamentos,
  resumoFinanceiro,
} from '../../api/financeiro'

// ── Meu dinheiro — fluxo de caixa "anti-erro" ──────────────────────────────────
// A pessoa escreve do jeito dela ("vendi 20 brigadeiros por 100", "mercado 80 e
// gás 110") ou manda o print do Pix; a IA organiza e ela só CONFIRMA. Nada é
// salvo sem confirmação. Fallback manual quando a IA não entende/está fora.

const mesStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
const rotuloMes = (d) => {
  const s = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}
const rotuloDia = (iso) => {
  const [ano, m, dia] = iso.split('-').map(Number)
  const data = new Date(ano, m - 1, dia)
  const hoje = new Date()
  const ontem = new Date(); ontem.setDate(hoje.getDate() - 1)
  const mesmo = (a, b) => a.toDateString() === b.toDateString()
  if (mesmo(data, hoje)) return 'Hoje'
  if (mesmo(data, ontem)) return 'Ontem'
  return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

const ORIGEM_ICONE = { comprovante: '📄', nota: '🧾', whatsapp: '💬' }

export default function Financeiro() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fotoRef = useRef()

  const [mesData, setMesData] = useState(() => new Date())
  const mes = mesStr(mesData)

  const [texto, setTexto] = useState('')
  const [pendentes, setPendentes] = useState([]) // interpretados pela IA, aguardando confirmação
  const [manual, setManual] = useState(null)     // { tipo } → form manual aberto
  const [manualValor, setManualValor] = useState('')
  const [manualDesc, setManualDesc] = useState('')
  const [confirmar, setConfirmar] = useState(null) // lançamento a deletar
  const [erro, setErro] = useState('')

  const resumoQ = useQuery({
    queryKey: ['financeiro-resumo', mes],
    queryFn: () => resumoFinanceiro(mes).then((r) => r.data),
  })
  const lancsQ = useQuery({
    queryKey: ['financeiro-lancamentos', mes],
    queryFn: () => listarLancamentos(mes).then((r) => r.data),
  })
  const resumo = resumoQ.data
  const lancs = lancsQ.data ?? []

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['financeiro-resumo'] })
    queryClient.invalidateQueries({ queryKey: ['financeiro-lancamentos'] })
  }

  const mudarMes = (delta) => {
    const d = new Date(mesData)
    d.setMonth(d.getMonth() + delta)
    setMesData(d)
  }

  // ── IA: interpretar texto ──────────────────────────────────────────────────
  const interpretar = useMutation({
    mutationFn: (t) => interpretarLancamento(t).then((r) => r.data),
    onSuccess: (data) => {
      if (!data.lancamentos.length) {
        setErro('Não entendi um valor aí. Tenta de novo com o número, ex: "mercado 80".')
        return
      }
      setErro('')
      setPendentes(data.lancamentos.map((l, i) => ({ ...l, _key: Date.now() + i, origem: 'ia_texto' })))
      setTexto('')
    },
    onError: (e) => {
      // IA fora do ar / sem chave → oferece o caminho manual
      setErro(e.status === 503 || e.status === 502
        ? 'A IA está fora do ar agora. Use os botões Entrou/Saiu aqui embaixo.'
        : e.message)
    },
  })

  // ── IA: comprovante ────────────────────────────────────────────────────────
  const comprovante = useMutation({
    mutationFn: (file) => lerComprovante(file).then((r) => r.data),
    onSuccess: (data) => {
      setErro('')
      const l = data.lancamento
      const desc = l.descricao || (l.contraparte ? `Pix de ${l.contraparte}` : 'Comprovante')
      setPendentes((prev) => [...prev, { ...l, descricao: desc, _key: Date.now(), origem: 'comprovante' }])
    },
    onError: (e) => setErro(e.message),
  })

  // ── Salvar (após confirmação) ──────────────────────────────────────────────
  const salvar = useMutation({
    mutationFn: async (itens) => {
      for (const l of itens) {
        await criarLancamento({
          tipo: l.tipo,
          valor: l.valor,
          descricao: l.descricao || null,
          categoria: l.categoria || null,
          data: l.data || undefined,
          origem: l.origem || 'manual',
        })
      }
    },
    onSuccess: () => { setPendentes([]); invalidar() },
    onError: (e) => setErro(e.message),
  })

  const salvarManual = () => {
    const valor = parseDecimal(manualValor)
    if (!valor || valor <= 0) { setErro('Escreva o valor, ex: 25,90'); return }
    setErro('')
    salvar.mutate([{ tipo: manual.tipo, valor, descricao: manualDesc.trim() || null, origem: 'manual' }])
    setManual(null); setManualValor(''); setManualDesc('')
  }

  const remover = useMutation({
    mutationFn: deletarLancamento,
    onSuccess: invalidar,
    onError: (e) => setErro(e.message),
  })

  // agrupa por dia (a lista já vem ordenada desc do backend)
  const porDia = []
  for (const l of lancs) {
    const grupo = porDia[porDia.length - 1]
    if (grupo && grupo.data === l.data) grupo.itens.push(l)
    else porDia.push({ data: l.data, itens: [l] })
  }

  const processando = interpretar.isPending || comprovante.isPending || salvar.isPending

  return (
    <Layout title="Meu dinheiro" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4 space-y-4">
        {/* Navegação de mês */}
        <div className="flex items-center justify-between">
          <button onClick={() => mudarMes(-1)} aria-label="Mês anterior" className="p-2 -ml-2 text-on-surface-dim">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
          </button>
          <p className="font-sans text-base font-semibold text-on-surface">{rotuloMes(mesData)}</p>
          <button onClick={() => mudarMes(1)} aria-label="Próximo mês" className="p-2 -mr-2 text-on-surface-dim">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Resumo do mês */}
        <div className="rounded-2xl bg-primary text-on-primary px-4 py-5 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-primary/60 mb-1">Sobrou</p>
          <p className={`qtm-num text-4xl font-bold ${(resumo?.sobra ?? 0) < 0 ? 'text-danger' : 'text-accent-soft'}`}>
            {resumo ? brl(resumo.sobra) : '…'}
          </p>
          <div className="flex justify-center gap-6 mt-3 pt-3 border-t border-on-primary/15">
            <p className="font-sans text-sm text-on-primary/80">
              Entrou <span className="qtm-num font-semibold text-positive">{resumo ? brl(resumo.entradas) : '…'}</span>
            </p>
            <p className="font-sans text-sm text-on-primary/80">
              Saiu <span className="qtm-num font-semibold text-danger">{resumo ? brl(resumo.saidas) : '…'}</span>
            </p>
          </div>
        </div>

        {erro && (
          <div className="bg-danger-bg text-on-danger-bg rounded-xl px-3 py-2">
            <p className="font-sans text-sm">{erro}</p>
          </div>
        )}

        {/* ── Registrar: texto livre + comprovante ── */}
        {pendentes.length === 0 && (
          <div className="card space-y-3">
            <p className="font-sans text-sm font-semibold text-on-surface">
              O que entrou ou saiu?
            </p>
            <textarea
              className="input w-full h-20 text-sm"
              placeholder={'Escreva do seu jeito, ex:\n"vendi 20 brigadeiros por 100"\n"mercado 80 e gás 110"'}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => texto.trim() && interpretar.mutate(texto.trim())}
                disabled={!texto.trim() || processando}
                className="btn-primary flex-1 py-2.5"
              >
                {interpretar.isPending ? 'Entendendo…' : 'Registrar'}
              </button>
              <button
                onClick={() => fotoRef.current?.click()}
                disabled={processando}
                className="btn-ghost flex-none w-auto px-4 py-2.5 whitespace-nowrap"
              >
                {comprovante.isPending ? 'Lendo…' : '📄 Print do Pix'}
              </button>
            </div>
            <input ref={fotoRef} type="file" accept="image/*,application/pdf" className="hidden"
              onChange={(e) => { const f = e.target.files[0]; if (f) comprovante.mutate(f); e.target.value = '' }} />

            {/* Fallback manual */}
            <div className="flex items-center gap-2 pt-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-dim">ou direto:</span>
              <button onClick={() => { setManual({ tipo: 'entrada' }); setErro('') }}
                className="rounded-full border border-outline-strong px-3 py-1 font-sans text-xs font-semibold text-positive">＋ Entrou</button>
              <button onClick={() => { setManual({ tipo: 'saida' }); setErro('') }}
                className="rounded-full border border-outline-strong px-3 py-1 font-sans text-xs font-semibold text-danger">－ Saiu</button>
            </div>

            {manual && (
              <div className="bg-surface-1 rounded-xl p-3 space-y-2">
                <p className="font-sans text-sm font-semibold text-on-surface">
                  {manual.tipo === 'entrada' ? 'Quanto entrou?' : 'Quanto saiu?'}
                </p>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 w-32">
                    <span className="font-mono text-sm text-on-surface-dim">R$</span>
                    <input type="text" inputMode="decimal" className="input text-sm" value={manualValor}
                      onChange={(e) => setManualValor(e.target.value)} placeholder="25,90" autoFocus
                      aria-label="Valor" />
                  </div>
                  <input type="text" className="input flex-1 text-sm" value={manualDesc}
                    onChange={(e) => setManualDesc(e.target.value)} placeholder="do quê? (opcional)"
                    aria-label="Descrição" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setManual(null)} className="btn-ghost flex-1 py-2">Cancelar</button>
                  <button onClick={salvarManual} disabled={salvar.isPending} className="btn-primary flex-1 py-2">Salvar</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Confirmação do que a IA entendeu ── */}
        {pendentes.length > 0 && (
          <div className="card space-y-3">
            <p className="font-sans text-sm text-on-surface">
              Entendi assim 👇 confere e confirma:
            </p>
            {pendentes.map((l) => (
              <div key={l._key} className="flex items-center gap-3 bg-surface-1 rounded-xl px-3 py-2.5">
                <span className={`font-sans text-lg font-bold ${l.tipo === 'entrada' ? 'text-positive' : 'text-danger'}`}>
                  {l.tipo === 'entrada' ? '＋' : '－'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm text-on-surface truncate">{l.descricao || (l.tipo === 'entrada' ? 'Entrada' : 'Saída')}</p>
                  <p className="font-mono text-[10px] text-on-surface-dim">
                    {l.categoria || 'sem categoria'}{l.data ? ` · ${rotuloDia(l.data)}` : ''}
                  </p>
                </div>
                <span className="qtm-num text-base font-bold text-on-surface">{brl(l.valor)}</span>
                <button onClick={() => setPendentes((p) => p.filter((x) => x._key !== l._key))}
                  aria-label="Remover" className="text-on-surface-dim px-1">✕</button>
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={() => setPendentes([])} className="btn-ghost flex-1 py-2.5">Cancelar</button>
              <button onClick={() => salvar.mutate(pendentes)} disabled={salvar.isPending}
                className="btn-primary flex-1 py-2.5">
                {salvar.isPending ? 'Salvando…' : pendentes.length > 1 ? 'Confirmar tudo' : 'Confirmar'}
              </button>
            </div>
          </div>
        )}

        {/* ── Lançamentos do mês ── */}
        {lancs.length === 0 && !lancsQ.isLoading ? (
          <p className="font-sans text-sm text-on-surface-dim text-center py-4">
            Nada registrado em {rotuloMes(mesData).toLowerCase()} ainda.
          </p>
        ) : (
          porDia.map((grupo) => (
            <div key={grupo.data}>
              <p className="label mb-2">{rotuloDia(grupo.data)}</p>
              <div className="card p-0 overflow-hidden">
                {grupo.itens.map((l) => (
                  <div key={l.id} className="flex items-center gap-3 border-b border-outline px-4 py-3 last:border-b-0">
                    <span className={`font-sans text-lg font-bold ${l.tipo === 'entrada' ? 'text-positive' : 'text-danger'}`}>
                      {l.tipo === 'entrada' ? '＋' : '－'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm text-on-surface truncate">
                        {ORIGEM_ICONE[l.origem] ? `${ORIGEM_ICONE[l.origem]} ` : ''}{l.descricao || (l.tipo === 'entrada' ? 'Entrada' : 'Saída')}
                      </p>
                      {l.categoria && <p className="font-mono text-[10px] text-on-surface-dim">{l.categoria}</p>}
                    </div>
                    <span className={`qtm-num text-sm font-bold ${l.tipo === 'entrada' ? 'text-positive' : 'text-on-surface'}`}>
                      {l.tipo === 'entrada' ? '+' : '−'} {brl(l.valor)}
                    </span>
                    <button onClick={() => setConfirmar(l)} aria-label="Apagar lançamento"
                      className="text-on-surface-dim px-1">✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Onde foi o dinheiro (categorias de saída) */}
        {resumo?.saidas_por_categoria?.length > 0 && (
          <div className="card">
            <p className="label mb-2">Pra onde foi o dinheiro</p>
            {resumo.saidas_por_categoria.map((c) => (
              <div key={c.categoria} className="flex items-center justify-between py-1.5">
                <span className="font-sans text-sm text-on-surface capitalize">{c.categoria}</span>
                <span className="qtm-num text-sm text-on-surface">{brl(c.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmar}
        onClose={() => setConfirmar(null)}
        onConfirm={() => { remover.mutate(confirmar.id); setConfirmar(null) }}
        title="Apagar lançamento?"
        message={confirmar ? `${confirmar.descricao || 'Este lançamento'} · ${brl(confirmar.valor)}` : ''}
        confirmLabel="Apagar"
      />
    </Layout>
  )
}
