import { useEffect, useState } from 'react'
import { brl } from '../utils/format'

// 52 semanas / 12 meses ≈ 4,33 semanas por mês
const SEMANAS_MES = 52 / 12

/**
 * Bloco recolhível que calcula o valor-hora a partir de salário mensal +
 * carga horária semanal. Não salva nada por si só: ao tocar em "Usar este
 * valor" chama `onUsar(valor)` e o pai decide o que fazer (preencher o campo).
 *
 * Props:
 *  - onUsar(valor: number)  — obrigatório
 *  - storageKey?: string    — se passado, lembra salário/horas no aparelho
 *  - idPrefix?: string      — evita colisão de ids quando há mais de uma na tela
 */
export default function CalculadoraValorHora({ onUsar, storageKey, idPrefix = 'calc' }) {
  const [aberto, setAberto] = useState(false)
  const [dados, setDados] = useState(() => {
    if (!storageKey) return { salario: '', horas: '' }
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || { salario: '', horas: '' }
    } catch {
      return { salario: '', horas: '' }
    }
  })

  useEffect(() => {
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(dados))
  }, [storageKey, dados])

  const valorHora = (() => {
    const s = parseFloat(String(dados.salario).replace(',', '.'))
    const h = parseFloat(String(dados.horas).replace(',', '.'))
    if (!s || !h || s <= 0 || h <= 0) return null
    return s / (h * SEMANAS_MES)
  })()

  const usar = () => {
    if (valorHora == null) return
    onUsar(valorHora)
    setAberto(false)
  }

  return (
    <div className="border-t border-line pt-2">
      <button type="button" onClick={() => setAberto((v) => !v)} aria-expanded={aberto}
        className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-ink">
        <span className="qtm-num">{aberto ? '−' : '+'}</span>
        Calcular a partir do salário
      </button>
      {aberto && (
        <div className="mt-3 space-y-3 bg-bone border border-line p-3">
          <div>
            <label htmlFor={`${idPrefix}-sal`} className="label">Salário mensal (R$)</label>
            <input id={`${idPrefix}-sal`} className="input qtm-num" inputMode="decimal"
              value={dados.salario}
              onChange={(e) => setDados((d) => ({ ...d, salario: e.target.value }))}
              placeholder="Ex.: 1500" />
          </div>
          <div>
            <label htmlFor={`${idPrefix}-h`} className="label">Horas por semana</label>
            <input id={`${idPrefix}-h`} className="input qtm-num" inputMode="decimal"
              value={dados.horas}
              onChange={(e) => setDados((d) => ({ ...d, horas: e.target.value }))}
              placeholder="Ex.: 44" />
          </div>
          <p className="text-xs text-mute">
            Salário de quem produz (ou seu pró-labore) dividido pela jornada do mês.
            44h/semana é a jornada cheia (CLT).
          </p>
          {valorHora != null ? (
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-ink">
                ≈ <span className="qtm-num font-semibold">{brl(valorHora)}</span> por hora
              </p>
              <button type="button" onClick={usar}
                className="btn-primary px-3 py-2 text-[11px]">Usar este valor</button>
            </div>
          ) : (
            <p className="text-xs text-mute">Preencha salário e horas para ver o valor-hora.</p>
          )}
        </div>
      )}
    </div>
  )
}
