import api from './client'

export const listarCustosFixos = () => api.get('/custos-fixos/')
export const resumoCustosFixos = () => api.get('/custos-fixos/resumo')
export const criarCustoFixo = (dados) => api.post('/custos-fixos/', dados)
export const atualizarCustoFixo = (id, dados) => api.put(`/custos-fixos/${id}`, dados)
export const deletarCustoFixo = (id) => api.delete(`/custos-fixos/${id}`)
