// Fórmula de custo — espelha o backend (app/routers/custos.py + unidades.py).
// Consumo na receita é sempre em g/ml/unid. kg/L são convertidos ×1000.

export function normalizar(nome) {
  return (nome || '').toLowerCase().trim()
}

export function fatorUnidade(unidade) {
  return unidade === 'kg' || unidade === 'L' ? 1000 : 1
}

// Custo por unidade-base (g/ml/unid) a partir do preço de uma embalagem.
export function custoUnitario(preco, quantidadeEmbalagem, unidade, fatorCorrecao = 1) {
  const denom = quantidadeEmbalagem * fatorUnidade(unidade)
  if (!preco || !denom) return 0
  return preco / denom / (fatorCorrecao || 1)
}
