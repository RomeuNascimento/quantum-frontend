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

// Extrai a contagem do texto original da receita ("3 ovos" → 3, "2 limões" → 2).
// Usado para ingredientes cobrados por unidade (unid): consumo é contagem, não peso.
export function contagemDe(unidadeOriginal) {
  if (!unidadeOriginal) return null
  const m = String(unidadeOriginal).replace(',', '.').match(/(\d+(?:\.\d+)?)/)
  return m ? parseFloat(m[1]) : null
}

// Converte uma quantidade de embalagem entre unidades (kg↔g, L↔ml). Usado ao
// gravar um preço num ingrediente já existente cuja unidade difere da coletada.
export function converterEmbalagem(qtd, deUnidade, paraUnidade) {
  const q = parseFloat(qtd) || 0
  return q * fatorUnidade(deUnidade) / fatorUnidade(paraUnidade)
}

// Quantidade efetiva consumida na receita, conforme a unidade de PREÇO do ingrediente.
// Se o preço é por 'unid', o consumo é a contagem ('3 ovos' → 3). Senão, é o peso em g/ml.
export function quantidadeConsumida({ unidadePreco, quantidade_g, unidade_original }) {
  if (unidadePreco === 'unid') {
    const c = contagemDe(unidade_original)
    return c ?? (parseFloat(quantidade_g) || 0)
  }
  return parseFloat(quantidade_g) || 0
}
