import api from './client'

export const listarReceitas = () => api.get('/receitas/')
export const criarReceita = (dados) => api.post('/receitas/', dados)
export const detalharReceita = (id) => api.get(`/receitas/${id}`)
export const atualizarReceita = (id, dados) => api.put(`/receitas/${id}`, dados)
export const deletarReceita = (id) => api.delete(`/receitas/${id}`)
