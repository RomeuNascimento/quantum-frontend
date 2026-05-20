import api from './client'

export const login = (dados) => api.post('/auth/login', dados)
export const register = (dados) => api.post('/auth/register', dados)
export const getMe = () => api.get('/auth/me')
export const getConfiguracao = () => api.get('/auth/configuracao')
export const updateConfiguracao = (dados) => api.put('/auth/configuracao', dados)
