import api from './client'

export const listarColaboradores = () => api.get('/colaboradores/')
export const criarColaborador = (dados) => api.post('/colaboradores/', dados)
export const atualizarColaborador = (id, dados) => api.put(`/colaboradores/${id}`, dados)
export const deletarColaborador = (id) => api.delete(`/colaboradores/${id}`)
