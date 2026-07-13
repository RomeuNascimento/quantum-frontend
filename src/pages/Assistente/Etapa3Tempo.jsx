import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getConfiguracao, updateConfiguracao } from '../../api/auth'
import { sugerirValorHora } from '../../api/ia'
import { brl, parseDecimal } from '../../utils/format'

// ── Etapa 3 do Assistente — TEMPO DE PREPARO → MÃO DE OBRA ──────────────────────
// Mostra o tempo extraído da receita (editável) e pergunta como a pessoa pensa o
// próprio trabalho: por hora, por salário (→ vira valor-hora) ou não contar agora.
// Os 3 desembocam num valor-hora; MO = (min/60) × valor-hora.

function Bolha({ children }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center font-serif text-sm font-bold">Q</div>
      <div className="flex-1 bg-card border border-outline rounded-2xl px-4 py-3">{children}</div>
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

  // Sugestão de valor-hora por IA (pra quem não faz ideia de quanto cobrar)
  const [sugerindo, setSugerindo] = useState(false)
  const [sugestao, setSugestao] = useState(null)
  const [sugErro, setSugErro] = useState('')

  const pedirSugestao = async () => {
    setSugErro(''); setSugerindo(true)
    try {
      const atividade = receita?.nome ? `faz ${receita.nome} para vender` : 'doces e salgados caseiros para vender'
      const r = await sugerirValorHora(atividade)
      setValorHora(String(r.data.valor_hora).replace('.', ','))
      setSugestao(r.data)
    } catch (e) {
      setSugErro(e.message)
    } finally {
      setSugerindo(false)
    }
  }

  // inicializa o modo uma vez quando a config chega
  if (modo === null && configQ.data) {
    if (valorHoraSalvo > 0) { setModo('hora'); setValorHora(String(valorHoraSalvo).replace('.', ',')) }
    else setModo('hora')
  }

  // valor-hora efetivo conforme o modo (aceita vírgula decimal)
  const vh = modo === 'salario'
    ? (parseDecimal(salario) || 0) / (parseDecimal(horasMes) || 1)
    : modo === 'hora'
      ? (parseDecimal(valorHora) || 0)
      : 0

  const custoMO = (parseDecimal(tempoMin) || 0) / 60 * vh

  const podeAvancar = modo === 'nao'
    || (modo === 'hora' && parseDecimal(valorHora) > 0)
    || (modo === 'salario' && parseDecimal(salario) > 0 && parseDecimal(horasMes) > 0)

  const avancar = async () => {
    setErro(''); setSalvando(true)
    try {
      // persiste o valor-hora (hora/salário) para reusar nas próximas receitas
      if (modo !== 'nao' && vh > 0 && vh !== valorHoraSalvo) {
        await updateConfiguracao({ valor_hora_padrao: vh })
        queryClient.invalidateQueries({ queryKey: ['configuracao'] })
      }
      onConcluir({ tempoMin: parseDecimal(tempoMin) || 0, valorHora: vh, custoMO, contar: modo !== 'nao' })
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="px-4 pt-5 pb-28 space-y-4">
      <Bolha>
        <p className="font-sans text-sm text-on-surface">
          Peguei <strong>~{tempoExtraido}min</strong> de preparo na receita. Confere e me diz como
          você quer contar o <strong>seu trabalho</strong>. 👇
        </p>
      </Bolha>

      {/* Tempo editável */}
      <div className="border border-outline rounded-xl bg-card px-3 py-3">
        <p className="label">Tempo de preparo</p>
        <div className="flex items-center gap-2">
          <input type="number" inputMode="numeric" className="input w-24 text-sm" value={tempoMin}
            onChange={(e) => setTempoMin(e.target.value)} aria-label="Tempo em minutos" />
          <span className="font-mono text-xs text-on-surface-dim">minutos</span>
        </div>
      </div>

      {/* Seletor de modo */}
      <div className="grid grid-cols-3 gap-2">
        {MODOS.map((m) => (
          <button key={m.id} onClick={() => setModo(m.id)}
            className={`border rounded-xl px-2 py-2.5 text-left transition-colors ${modo === m.id ? 'border-primary bg-primary text-on-primary' : 'border-outline bg-card text-on-surface'}`}>
            <p className="font-sans text-[13px] font-semibold leading-tight">{m.titulo}</p>
            <p className={`font-sans text-[10px] mt-0.5 leading-tight ${modo === m.id ? 'text-on-primary/70' : 'text-on-surface-dim'}`}>{m.sub}</p>
          </button>
        ))}
      </div>

      {/* Campos por modo */}
      {modo === 'hora' && (
        <div className="border border-outline rounded-xl bg-surface-1 px-3 py-3 space-y-2">
          <p className="label">Quanto vale 1 hora do seu trabalho?</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-on-surface-dim">R$</span>
            <input type="text" inputMode="decimal" className="input w-28 text-sm" value={valorHora}
              onChange={(e) => { setValorHora(e.target.value); setSugestao(null) }} placeholder="20,00" aria-label="Valor da hora" />
            <span className="font-mono text-xs text-on-surface-dim">/hora</span>
          </div>
          {sugestao ? (
            <p className="font-sans text-[13px] text-on-surface">
              <span className="badge bg-warm text-on-warm mr-1.5">EST</span>
              {sugestao.explicacao || 'Valor aproximado de mercado — ajuste se quiser.'}
            </p>
          ) : (
            <button onClick={pedirSugestao} disabled={sugerindo}
              className="font-sans text-[13px] font-semibold text-primary underline underline-offset-2 disabled:opacity-40">
              {sugerindo ? 'Pensando…' : '🤖 Não sei quanto cobrar — me sugere um valor'}
            </button>
          )}
          {sugErro && <p className="font-sans text-[13px] text-danger">{sugErro}</p>}
        </div>
      )}

      {modo === 'salario' && (
        <div className="border border-outline rounded-xl bg-surface-1 px-3 py-3 space-y-2">
          <p className="label">Quanto você quer ganhar por mês?</p>
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className="font-mono text-sm text-on-surface-dim">R$</span>
                <input type="text" inputMode="decimal" className="input w-full text-sm" value={salario}
                  onChange={(e) => setSalario(e.target.value)} placeholder="2000" aria-label="Salário mensal desejado" />
              </div>
            </div>
            <div className="w-28">
              <p className="font-mono text-[10px] text-on-surface-dim mb-1">horas/mês</p>
              <input type="number" inputMode="numeric" className="input w-full text-sm" value={horasMes}
                onChange={(e) => setHorasMes(e.target.value)} placeholder="160" aria-label="Horas trabalhadas no mês" />
            </div>
          </div>
          {vh > 0 && (
            <p className="font-sans text-[13px] text-on-surface">
              → sua hora vale <strong className="qtm-num">{brl(vh)}</strong>
            </p>
          )}
        </div>
      )}

      {modo === 'nao' && (
        <div className="border border-outline rounded-xl bg-surface-1 px-3 py-3">
          <p className="font-sans text-sm text-on-surface-dim">
            Beleza, não vou contar mão de obra agora. Só lembre que sua <strong className="text-on-surface">margem</strong>{' '}
            precisa cobrir o seu tempo. Dá pra incluir depois.
          </p>
        </div>
      )}

      {erro && (
        <div className="bg-danger-bg text-on-danger-bg rounded-xl px-3 py-2">
          <p className="font-sans text-sm">{erro}</p>
        </div>
      )}

      {/* Resumo da MO */}
      {modo !== 'nao' && vh > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-primary text-on-primary px-4 py-3">
          <span className="font-mono text-xs uppercase tracking-widest">Custo de mão de obra</span>
          <span className="qtm-num text-base font-bold text-accent-soft">{brl(custoMO)}</span>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline px-4 py-3 z-30">
        <button onClick={avancar} disabled={!podeAvancar || salvando}
          className="btn-primary max-w-xl mx-auto block">
          {salvando ? 'Salvando…' : 'Continuar →'}
        </button>
      </div>
    </div>
  )
}
