import api from './client'

export const listarProdutos = () => api.get('/produtos/')
export const criarProduto = (dados) => api.post('/produtos/', dados)
export const detalharProduto = (id) => api.get(`/produtos/${id}`)
export const atualizarProduto = (id, dados) => api.put(`/produtos/${id}`, dados)
export const deletarProduto = (id) => api.delete(`/produtos/${id}`)
