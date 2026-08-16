import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getConfiguracao, updateConfiguracao } from '../../api/auth'
import { brl, parseDecimal } from '../../utils/format'

// ── Etapa 3 do Assistente — SEU TRABALHO (mão de obra) ─────────────────────────
// À prova de erro, zero jargão:
// · Quem JÁ tem valor-hora salvo não responde nada — vê o custo pronto e segue.
// · Quem não tem responde DUAS perguntas de toque (quanto quer ganhar por mês ·
//   quantas horas trabalha por dia) → a hora sai sozinha (22 dias úteis/mês).
// · "Digitar minha hora" e "não contar agora" viram links discretos, não cards.

function Bolha({ children }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center font-serif text-sm font-bold">Q</div>
      <div className="flex-1 bg-card border border-outline rounded-2xl px-4 py-3">{children}</div>
    </div>
  )}

const DIAS_MES = 22 // dias úteis considerados no salário → hora
const SALARIOS = [1500, 2000, 3000]
const HORAS_DIA = [2, 4, 6, 8]

const numBR = (v) => v.toLocaleString('pt-BR')

function Chip({ ativo, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`rounded-full border px-4 py-2.5 font-sans text-sm font-semibold transition-colors
        ${ativo ? 'border-primary bg-primary text-on-primary' : 'border-outline-strong bg-card text-on-surface active:bg-surface-1'}`}>
      {children}
    </button>
  )
}

export default function Etapa3Tempo({ receita, onConcluir }) {
  const queryClient = useQueryClient()
  const configQ = useQuery({
    queryKey: ['configuracao'],
    queryFn: () => getConfiguracao().then((r) => r.data),
  })

  const tempoExtraido = (receita?.etapas_mo || []).reduce((s, e) => s + (parseFloat(e.tempo_min) || 0), 0)
  const [tempoMin, setTempoMin] = useState(tempoExtraido)
  const vhSalvo = configQ.data?.valor_hora_padrao || 0

  // modo: null = automático (usa o salvo se existir, senão guiado)
  //       'guiado' (2 perguntas) | 'hora' (digita direto) | 'nao' (não contar)
  const [modo, setModo] = useState(null)
  const [salario, setSalario] = useState(null)     // chip escolhido (número) ou 'outro'
  const [outroSalario, setOutroSalario] = useState('')
  const [horasDia, setHorasDia] = useState(null)
  const [valorHora, setValorHora] = useState('')   // modo 'hora'
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const efetivo = modo ?? (vhSalvo > 0 ? 'salvo' : 'guiado')

  const salarioNum = salario === 'outro' ? (parseDecimal(outroSalario) || 0) : (salario || 0)
  const vh =
    efetivo === 'nao' ? 0
    : efetivo === 'salvo' ? vhSalvo
    : efetivo === 'hora' ? (parseDecimal(valorHora) || 0)
    : salarioNum > 0 && horasDia ? salarioNum / (horasDia * DIAS_MES)
    : 0

  const minutos = parseDecimal(tempoMin) || 0
  const custoMO = (minutos / 60) * vh
  const podeAvancar = efetivo === 'nao' || vh > 0

  const avancar = async () => {
    setErro(''); setSalvando(true)
    try {
      // guarda o valor-hora pra próxima receita já vir calculada
      if (efetivo !== 'nao' && vh > 0 && vh !== vhSalvo) {
        await updateConfiguracao({ valor_hora_padrao: vh })
        queryClient.invalidateQueries({ queryKey: ['configuracao'] })
      }
      onConcluir({ tempoMin: minutos, valorHora: vh, custoMO, contar: efetivo !== 'nao' })
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
          Peguei <strong>~{tempoExtraido}min</strong> de preparo na receita.
          {efetivo === 'salvo' ? (
            <> Seu tempo também custa — <strong>já deixei calculado</strong> com o valor que você usa. 👇</>
          ) : (
            <> Seu tempo também custa! Me responde <strong>duas coisinhas</strong> que eu coloco ele na conta. 👇</>
          )}
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

      {/* ── Valor-hora já salvo: nada a responder ── */}
      {efetivo === 'salvo' && (
        <div className="border border-outline rounded-xl bg-surface-1 px-4 py-3">
          <p className="label">Seu trabalho</p>
          <p className="font-sans text-sm text-on-surface">
            <span className="qtm-num">{minutos}min</span> × <strong className="qtm-num">{brl(vhSalvo)}</strong> por hora
          </p>
          <button onClick={() => setModo('guiado')}
            className="font-sans text-sm text-secondary underline underline-offset-2 mt-2">
            Usar outro valor
          </button>
        </div>
      )}

      {/* ── Guiado: 2 perguntas de toque ── */}
      {efetivo === 'guiado' && (
        <>
          <div className="border border-outline rounded-xl bg-card px-4 py-4">
            <p className="font-sans text-sm font-semibold text-on-surface mb-3">
              1 · Quanto você quer ganhar por mês com seu trabalho?
            </p>
            <div className="flex flex-wrap gap-2">
              {SALARIOS.map((s) => (
                <Chip key={s} ativo={salario === s} onClick={() => setSalario(s)}>
                  <span className="qtm-num">R$ {numBR(s)}</span>
                </Chip>
              ))}
              <Chip ativo={salario === 'outro'} onClick={() => setSalario('outro')}>Outro</Chip>
            </div>
            {salario === 'outro' && (
              <div className="flex items-center gap-2 mt-3">
                <span className="font-mono text-sm text-on-surface-dim">R$</span>
                <input type="text" inputMode="decimal" className="input w-32 text-sm" value={outroSalario}
                  onChange={(e) => setOutroSalario(e.target.value)} placeholder="2500" autoFocus
                  aria-label="Quanto quer ganhar por mês" />
                <span className="font-mono text-xs text-on-surface-dim">por mês</span>
              </div>
            )}
          </div>

          <div className="border border-outline rounded-xl bg-card px-4 py-4">
            <p className="font-sans text-sm font-semibold text-on-surface mb-3">
              2 · Quantas horas por dia você trabalha nisso?
            </p>
            <div className="flex flex-wrap gap-2">
              {HORAS_DIA.map((h) => (
                <Chip key={h} ativo={horasDia === h} onClick={() => setHorasDia(h)}>
                  <span className="qtm-num">{h}h</span>
                </Chip>
              ))}
            </div>
          </div>

          {vh > 0 && (
            <div className="border border-outline rounded-xl bg-surface-1 px-4 py-3">
              <p className="font-sans text-sm text-on-surface">
                Então <strong>1 hora sua vale <span className="qtm-num">{brl(vh)}</span></strong>
              </p>
              <p className="font-sans text-xs text-on-surface-dim mt-1">
                (R$ {numBR(salarioNum)} ÷ {horasDia}h por dia × {DIAS_MES} dias no mês)
              </p>
            </div>
          )}

          <button onClick={() => setModo('hora')}
            className="font-sans text-sm text-secondary underline underline-offset-2 block">
            Já sei quanto vale minha hora — quero digitar
          </button>
        </>
      )}

      {/* ── Digitar a hora direto ── */}
      {efetivo === 'hora' && (
        <div className="border border-outline rounded-xl bg-surface-1 px-4 py-4">
          <p className="font-sans text-sm font-semibold text-on-surface mb-2">Quanto vale 1 hora do seu trabalho?</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-on-surface-dim">R$</span>
            <input type="text" inputMode="decimal" className="input w-28 text-sm" value={valorHora}
              onChange={(e) => setValorHora(e.target.value)} placeholder="20,00" autoFocus
              aria-label="Valor da hora" />
            <span className="font-mono text-xs text-on-surface-dim">por hora</span>
          </div>
          <button onClick={() => setModo('guiado')}
            className="font-sans text-sm text-secondary underline underline-offset-2 mt-3">
            Não sei — me ajuda a calcular
          </button>
        </div>
      )}

      {/* ── Não contar ── */}
      {efetivo === 'nao' && (
        <div className="border border-outline rounded-xl bg-surface-1 px-4 py-3">
          <p className="font-sans text-sm text-on-surface-dim">
            Beleza, não vou contar seu trabalho agora. Só lembre que a{' '}
            <strong className="text-on-surface">margem</strong> precisa cobrir o seu tempo.
            Dá pra incluir depois.
          </p>
          <button onClick={() => setModo(vhSalvo > 0 ? null : 'guiado')}
            className="font-sans text-sm text-secondary underline underline-offset-2 mt-2">
            Mudei de ideia — contar meu trabalho
          </button>
        </div>
      )}

      {erro && (
        <div className="bg-danger-bg text-on-danger-bg rounded-xl px-3 py-2">
          <p className="font-sans text-sm">{erro}</p>
        </div>
      )}

      {/* Resumo do custo de MO */}
      {efetivo !== 'nao' && vh > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-primary text-on-primary px-4 py-3">
          <span className="font-mono text-xs uppercase tracking-widest">Seu trabalho custa</span>
          <span className="qtm-num text-base font-bold text-accent-soft">{brl(custoMO)}</span>
        </div>
      )}

      {efetivo !== 'nao' && (
        <button onClick={() => setModo('nao')}
          className="font-sans text-sm text-on-surface-dim underline underline-offset-2 block mx-auto">
          Não quero contar meu trabalho agora
        </button>
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
