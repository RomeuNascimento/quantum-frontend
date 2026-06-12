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
