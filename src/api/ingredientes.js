import api from './client'

export const listarIngredientes = () => api.get('/ingredientes/')
export const criarIngrediente = (dados) => api.post('/ingredientes/', dados)
export const detalharIngrediente = (id) => api.get(`/ingredientes/${id}`)
export const atualizarIngrediente = (id, dados) => api.put(`/ingredientes/${id}`, dados)
export const deletarIngrediente = (id) => api.delete(`/ingredientes/${id}`)
export const adicionarPrecoIngrediente = (id, dados) => api.post(`/ingredientes/${id}/precos`, dados)
