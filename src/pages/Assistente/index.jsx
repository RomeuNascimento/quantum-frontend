import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { processarReceitas } from '../../api/ia'
import StepBar from './StepBar'

// ── Protótipo do Assistente Quantum — ETAPA 1 (Receita) ────────────────────────
// Reusa o endpoint /ia/receitas (sem mudança no backend). A intenção é dar a
// sensação de que a IA conduz: ela "fala", lê o que você manda e devolve pronto
// para confirmar. Etapas 2-4 (preços, tempo, preço final) entram depois.

function MsgIA({ children }) {
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 flex-shrink-0 bg-ink text-lime flex items-center justify-center font-mono text-xs font-bold">
        Q
      </div>
      <div className="flex-1 bg-receipt border border-line px-3 py-2.5">
        {children}
      </div>
    </div>
  )
}

export default function Assistente() {
  const navigate = useNavigate()
  const inputRef = useRef()

  const [fase, setFase] = useState('intro') // intro | processando | revisao | confirmado
  const [arquivo, setArquivo] = useState(null)
  const [texto, setTexto] = useState('')
  const [receita, setReceita] = useState(null)
  const [erro, setErro] = useState('')

  const totalTempo = (r) =>
    (r?.etapas_mo || []).reduce((s, e) => s + (parseFloat(e.tempo_min) || 0), 0)

  const processar = async () => {
    if (!arquivo && !texto.trim()) return
    setErro('')
    setFase('processando')
    try {
      // O endpoint aceita texto (.txt) ou imagem/PDF. Para texto digitado,
      // empacotamos como um arquivo .txt para reusar o mesmo caminho.
      const file = arquivo || new File([texto], 'receita.txt', { type: 'text/plain' })
      const r = await processarReceitas(file)
      const rec = (r.data.receitas || [])[0]
      if (!rec) {
        setErro('Não consegui identificar uma receita. Tente uma foto mais nítida ou digite o texto.')
        setFase('intro')
        return
      }
      setReceita({
        nome: rec.nome || '',
        tipo: rec.tipo || '',
        rendimento_g: rec.rendimento_g || 0,
        ingredientes: rec.ingredientes || [],
        etapas_mo: rec.etapas_mo || [],
      })
      setFase('revisao')
    } catch (e) {
      setErro(e.message)
      setFase('intro')
    }
  }

  const up = (campo, valor) => setReceita((r) => ({ ...r, [campo]: valor }))

  // ── INTRO ────────────────────────────────────────────────────────────────
  if (fase === 'intro') {
    return (
      <Layout title="Assistente" onBack={() => navigate('/dashboard')}>
        <StepBar atual={1} />
        <div className="px-4 pt-4 space-y-4">
          <MsgIA>
            <p className="font-sans text-sm text-ink">
              Oi! Eu sou o assistente do Quantum. Vou montar o preço do seu produto
              com você — <strong>sem formulário, sem digitação chata</strong>.
            </p>
            <p className="font-sans text-sm text-ink mt-2">
              Pra começar, me mostra a <strong>receita</strong>. Pode mandar uma foto,
              um print, um PDF — ou escrever aqui mesmo. Eu leio e organizo tudo. 📸
            </p>
          </MsgIA>

          {erro && (
            <div className="bg-rust/10 border border-rust px-3 py-2">
              <p className="font-sans text-sm text-rust">{erro}</p>
            </div>
          )}

          <button
            onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed border-line bg-receipt flex flex-col items-center justify-center py-10 active:bg-line"
          >
            <svg className="w-9 h-9 text-mute mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
              <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="font-mono text-xs uppercase tracking-widest text-mute">
              {arquivo ? arquivo.name : 'Tirar foto ou anexar arquivo'}
            </p>
            <p className="font-mono text-[10px] text-mute mt-1">Foto, PDF, Excel, CSV</p>
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf,.xlsx,.xls,.csv,.txt"
            className="hidden"
            onChange={(e) => setArquivo(e.target.files[0] || null)}
          />

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-line" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-mute">ou escreva</span>
            <div className="flex-1 border-t border-line" />
          </div>

          <textarea
            className="input w-full h-28 text-sm"
            placeholder={'Ex: Bolo de cenoura\n3 ovos, 2 xícaras de açúcar, 1 xícara de óleo,\n3 cenouras médias, 2 xícaras de farinha...'}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />

          <button
            onClick={processar}
            disabled={!arquivo && !texto.trim()}
            className="btn-primary w-full max-w-xl mx-auto block disabled:opacity-40"
          >
            Ler minha receita
          </button>
        </div>
      </Layout>
    )
  }

  // ── PROCESSANDO ──────────────────────────────────────────────────────────
  if (fase === 'processando') {
    return (
      <Layout title="Assistente">
        <StepBar atual={1} />
        <div className="px-4 pt-4 space-y-4">
          <MsgIA>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-lime/30 border-t-lime rounded-full animate-spin flex-shrink-0" />
              <p className="font-sans text-sm text-ink">
                Tô lendo sua receita e organizando os ingredientes...
              </p>
            </div>
          </MsgIA>
        </div>
      </Layout>
    )
  }

  // ── REVISÃO ──────────────────────────────────────────────────────────────
  if (fase === 'revisao') {
    return (
      <Layout title="Assistente" onBack={() => setFase('intro')}>
        <StepBar atual={1} />
        <div className="px-4 pt-4 pb-40 space-y-4">
          <MsgIA>
            <p className="font-sans text-sm text-ink">
              Pronto! Entendi sua receita assim 👇 Dá uma conferida e ajusta o que
              precisar — depois é só confirmar.
            </p>
          </MsgIA>

          {/* Card editável da receita */}
          <div className="border border-ink bg-bone">
            <div className="p-3 border-b border-line space-y-2">
              <div>
                <p className="label">Nome</p>
                <input className="input w-full text-sm font-medium" value={receita.nome}
                  aria-label="Nome da receita"
                  onChange={(e) => up('nome', e.target.value)} />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="label">Categoria</p>
                  <input className="input w-full text-xs" placeholder="opcional" value={receita.tipo}
                    aria-label="Categoria" onChange={(e) => up('tipo', e.target.value)} />
                </div>
                <div className="w-28">
                  <p className="label">Rende</p>
                  <div className="relative">
                    <input type="number" className="input w-full text-xs pr-5" value={receita.rendimento_g}
                      aria-label="Rendimento em gramas"
                      onChange={(e) => up('rendimento_g', e.target.value)} />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-mute">g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredientes */}
            <div className="p-3 border-b border-line">
              <p className="label mb-2">Ingredientes ({receita.ingredientes.length})</p>
              <div className="space-y-1.5">
                {receita.ingredientes.map((ing, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-lime flex-shrink-0" />
                    <span className="font-sans text-sm text-ink flex-1 truncate">{ing.nome}</span>
                    <span className="qtm-num text-xs text-mute">{ing.quantidade_g}g</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tempo de preparo (prévia da etapa 3) */}
            {receita.etapas_mo.length > 0 && (
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="label">Modo de preparo ({receita.etapas_mo.length} etapas)</p>
                  <span className="qtm-num text-xs text-ink">~{totalTempo(receita)}min</span>
                </div>
                <div className="space-y-1.5">
                  {receita.etapas_mo.map((e, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="qtm-num text-[11px] text-mute w-9 flex-shrink-0">{e.tempo_min}min</span>
                      <span className="font-sans text-xs text-ink">{e.descricao}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-16 left-0 right-0 bg-bone border-t border-line px-4 py-3 z-30">
          <button onClick={() => setFase('confirmado')} disabled={!receita.nome}
            className="btn-primary w-full max-w-xl mx-auto block disabled:opacity-40">
            Confirmar receita →
          </button>
        </div>
      </Layout>
    )
  }

  // ── CONFIRMADO (teaser das próximas etapas) ────────────────────────────────
  return (
    <Layout title="Assistente">
      <StepBar atual={2} />
      <div className="px-4 pt-4 space-y-4">
        <MsgIA>
          <p className="font-sans text-sm text-ink">
            Boa! Já tenho a receita <strong>{receita.nome}</strong> com{' '}
            {receita.ingredientes.length} ingredientes. ✅
          </p>
          <p className="font-sans text-sm text-ink mt-2">
            Agora o próximo passo é descobrir <strong>quanto custa cada ingrediente</strong>.
            Você vai poder mandar foto da nota fiscal ou da etiqueta — eu preencho os preços
            e você só confirma.
          </p>
        </MsgIA>

        <div className="border border-line bg-receipt px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-mute mb-1">Protótipo</p>
          <p className="font-sans text-sm text-ink">
            Esta é a <strong>Etapa 1</strong> do novo assistente. As próximas etapas
            (preços → tempo → preço final) entram em seguida. Quis te mostrar a "vibe"
            antes de construir o resto.
          </p>
        </div>

        <button onClick={() => { setFase('intro'); setArquivo(null); setTexto(''); setReceita(null) }}
          className="btn-ghost w-full">
          Testar com outra receita
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full">
          Voltar ao início
        </button>
      </div>
    </Layout>
  )
}
