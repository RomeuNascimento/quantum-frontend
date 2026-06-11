import api from './client'

export const relatorioMargem = () => api.get('/precificacao/relatorio-margem')

export const listarCanais = () => api.get('/precificacao/canais')
export const criarCanal = (dados) => api.post('/precificacao/canais', dados)
export const atualizarCanal = (id, dados) => api.put(`/precificacao/canais/${id}`, dados)
export const deletarCanal = (id) => api.delete(`/precificacao/canais/${id}`)

export const listarPrecosProduto = (produtoId) => api.get(`/precificacao/produtos/${produtoId}/precos`)
export const criarPrecoProduto = (produtoId, dados) => api.post(`/precificacao/produtos/${produtoId}/precos`, dados)
export const atualizarPrecoProduto = (produtoId, precoId, dados) =>
  api.put(`/precificacao/produtos/${produtoId}/precos/${precoId}`, dados)
export const deletarPrecoProduto = (produtoId, precoId) =>
  api.delete(`/precificacao/produtos/${produtoId}/precos/${precoId}`)
