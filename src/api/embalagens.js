import api from './client'

export const listarEmbalagens = () => api.get('/embalagens/')
export const criarEmbalagem = (dados) => api.post('/embalagens/', dados)
export const detalharEmbalagem = (id) => api.get(`/embalagens/${id}`)
export const atualizarEmbalagem = (id, dados) => api.put(`/embalagens/${id}`, dados)
export const deletarEmbalagem = (id) => api.delete(`/embalagens/${id}`)
export const adicionarPrecoEmbalagem = (id, dados) => api.post(`/embalagens/${id}/precos`, dados)
export const converterEmIngrediente = (id) => api.post(`/embalagens/${id}/converter-em-ingrediente`)
