import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getConfiguracao, updateConfiguracao } from '../../api/auth'
import { brl } from '../../utils/format'

// ── Etapa 3 do Assistente — TEMPO DE PREPARO → MÃO DE OBRA ──────────────────────
// Mostra o tempo extraído da receita (editável) e pergunta como a pessoa pensa o
// próprio trabalho: por hora, por salário (→ vira valor-hora) ou não contar agora.
// Os 3 desembocam num valor-hora; MO = (min/60) × valor-hora.

function Bolha({ children }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 flex-shrink-0 bg-ink text-lime flex items-center justify-center font-mono text-sm font-bold">Q</div>
      <div className="flex-1 bg-receipt border border-line px-4 py-3">{children}</div>
    </div>
  )
}

const MODOS = [
  { id: 'hora', titulo: 'Por hora', sub: 'Sei quanto vale minha hora' },
  { id: 'salario', titulo: 'Por salário', sub: 'Quanto quero ganhar no mês' },
  { id: 'nao', titulo: 'Não contar agora', sub: 'Só ingredientes + margem' },
]

export default function Etapa3Tempo({ receita, onConcluir }) {
  const queryClient = useQueryClient()
  const configQ = useQuery({
    queryKey: ['configuracao'],
    queryFn: () => getConfiguracao().then((r) => r.data),
  })

  const tempoExtraido = (receita?.etapas_mo || []).reduce((s, e) => s + (parseFloat(e.tempo_min) || 0), 0)
  const [tempoMin, setTempoMin] = useState(tempoExtraido)
  const valorHoraSalvo = configQ.data?.valor_hora_padrao || 0

  // modo: null até a pessoa escolher (se já tem valor-hora salvo, começa em 'hora')
  const [modo, setModo] = useState(null)
  const [valorHora, setValorHora] = useState('')
  const [salario, setSalario] = useState('')
  const [horasMes, setHorasMes] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // inicializa o modo uma vez quando a config chega
  if (modo === null && configQ.data) {
    if (valorHoraSalvo > 0) { setModo('hora'); setValorHora(String(valorHoraSalvo)) }
    else setModo('hora')
  }

  // valor-hora efetivo conforme o modo
  const vh = modo === 'salario'
    ? (parseFloat(salario) || 0) / (parseFloat(horasMes) || 1)
    : modo === 'hora'
      ? (parseFloat(valorHora) || 0)
      : 0

  const custoMO = (parseFloat(tempoMin) || 0) / 60 * vh

  const podeAvancar = modo === 'nao'
    || (modo === 'hora' && parseFloat(valorHora) > 0)
    || (modo === 'salario' && parseFloat(salario) > 0 && parseFloat(horasMes) > 0)

  const avancar = async () => {
    setErro(''); setSalvando(true)
    try {
      // persiste o valor-hora (hora/salário) para reusar nas próximas receitas
      if (modo !== 'nao' && vh > 0 && vh !== valorHoraSalvo) {
        await updateConfiguracao({ valor_hora_padrao: vh })
        queryClient.invalidateQueries({ queryKey: ['configuracao'] })
      }
      onConcluir({ tempoMin: parseFloat(tempoMin) || 0, valorHora: vh, custoMO, contar: modo !== 'nao' })
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="px-4 pt-5 pb-28 space-y-4">
      <Bolha>
        <p className="font-sans text-sm text-ink">
          Peguei <strong>~{tempoExtraido}min</strong> de preparo na receita. Confere e me diz como
          você quer contar o <strong>seu trabalho</strong>. 👇
        </p>
      </Bolha>

      {/* Tempo editável */}
      <div className="border border-line bg-bone px-3 py-3">
        <p className="label">Tempo de preparo</p>
        <div className="flex items-center gap-2">
          <input type="number" inputMode="numeric" className="input w-24 text-sm" value={tempoMin}
            onChange={(e) => setTempoMin(e.target.value)} aria-label="Tempo em minutos" />
          <span className="font-mono text-xs text-mute">minutos</span>
        </div>
      </div>

      {/* Seletor de modo */}
      <div className="grid grid-cols-3 gap-2">
        {MODOS.map((m) => (
          <button key={m.id} onClick={() => setModo(m.id)}
            className={`border px-2 py-2.5 text-left ${modo === m.id ? 'border-ink bg-ink text-bone' : 'border-line bg-bone text-ink'}`}>
            <p className="font-mono text-[11px] font-bold uppercase tracking-wide leading-tight">{m.titulo}</p>
            <p className={`font-mono text-[9px] mt-0.5 leading-tight ${modo === m.id ? 'text-bone/70' : 'text-mute'}`}>{m.sub}</p>
          </button>
        ))}
      </div>

      {/* Campos por modo */}
      {modo === 'hora' && (
        <div className="border border-line bg-receipt px-3 py-3">
          <p className="label">Quanto vale 1 hora do seu trabalho?</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-mute">R$</span>
            <input type="number" inputMode="decimal" className="input w-28 text-sm" value={valorHora}
              onChange={(e) => setValorHora(e.target.value)} placeholder="20,00" aria-label="Valor da hora" />
            <span className="font-mono text-xs text-mute">/hora</span>
          </div>
        </div>
      )}

      {modo === 'salario' && (
        <div className="border border-line bg-receipt px-3 py-3 space-y-2">
          <p className="label">Quanto você quer ganhar por mês?</p>
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className="font-mono text-sm text-mute">R$</span>
                <input type="number" inputMode="decimal" className="input w-full text-sm" value={salario}
                  onChange={(e) => setSalario(e.target.value)} placeholder="2000" aria-label="Salário mensal desejado" />
              </div>
            </div>
            <div className="w-28">
              <p className="font-mono text-[10px] text-mute mb-1">horas/mês</p>
              <input type="number" inputMode="numeric" className="input w-full text-sm" value={horasMes}
                onChange={(e) => setHorasMes(e.target.value)} placeholder="160" aria-label="Horas trabalhadas no mês" />
            </div>
          </div>
          {vh > 0 && (
            <p className="font-mono text-[11px] text-ink">
              → sua hora vale <strong className="qtm-num">{brl(vh)}</strong>
            </p>
          )}
        </div>
      )}

      {modo === 'nao' && (
        <div className="border border-line bg-receipt px-3 py-3">
          <p className="font-sans text-sm text-mute">
            Beleza, não vou contar mão de obra agora. Só lembre que sua <strong className="text-ink">margem</strong>{' '}
            precisa cobrir o seu tempo. Dá pra incluir depois.
          </p>
        </div>
      )}

      {erro && (
        <div className="bg-rust/10 border border-rust px-3 py-2">
          <p className="font-sans text-sm text-rust">{erro}</p>
        </div>
      )}

      {/* Resumo da MO */}
      {modo !== 'nao' && vh > 0 && (
        <div className="flex items-center justify-between border border-ink bg-ink text-bone px-4 py-3">
          <span className="font-mono text-xs uppercase tracking-widest">Custo de mão de obra</span>
          <span className="qtm-num text-base font-bold text-lime">{brl(custoMO)}</span>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-bone border-t border-line px-4 py-3 z-30">
        <button onClick={avancar} disabled={!podeAvancar || salvando}
          className="btn-primary w-full max-w-xl mx-auto block disabled:opacity-40">
          {salvando ? 'Salvando…' : 'Continuar →'}
        </button>
      </div>
    </div>
  )
}
