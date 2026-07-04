// Formatação numérica padrão do app — sempre pt-BR.
const fmt2 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const fmt4 = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
})

export const brl = (v) => fmt2.format(Number(v) || 0)
// Custos unitários (R$/g, R$/un) precisam de 4 casas
export const brl4 = (v) => fmt4.format(Number(v) || 0)

// Lê número digitado pelo usuário aceitando vírgula decimal ("5,99" → 5.99).
// parseFloat puro corta na vírgula ("5,99" → 5) — erro silencioso de preço.
export const parseDecimal = (v) => {
  if (typeof v === 'number') return v
  let s = String(v ?? '').trim()
  // "1.234,56" → tira os pontos de milhar quando a vírgula é o decimal
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}
