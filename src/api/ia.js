import api from './client'

export const processarNotaFiscal = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/ia/nota-fiscal', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export const processarReceitas = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/ia/receitas', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}

// Estima preço de mercado (BR) para uma lista de ingredientes (por nome).
// Devolve { itens: [{ nome, preco, quantidade_embalagem, unidade, fonte:'estimativa' }] }
export const estimarPrecos = (nomes) =>
  api.post('/ia/estimar-precos', { ingredientes: nomes.map((nome) => ({ nome })) })

// Sugere embalagem(ns) provável(is) do produto. Devolve { itens: [...] } (pode ser vazio).
export const sugerirEmbalagem = (produto) =>
  api.post('/ia/sugerir-embalagem', { produto })
