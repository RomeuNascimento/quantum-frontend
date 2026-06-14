import api from './client'

export const login = (dados) => api.post('/auth/login', dados)
export const register = (dados) => api.post('/auth/register', dados)
// Revoga o token atual no servidor (denylist por jti). O token é passado
// explicitamente porque o authStore já limpou o localStorage antes de chamar.
export const logout = (token) =>
  api.post('/auth/logout', null, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
export const getMe = () => api.get('/auth/me')
export const getConfiguracao = () => api.get('/auth/configuracao')
export const updateConfiguracao = (dados) => api.put('/auth/configuracao', dados)
// Troca a senha; o backend derruba as outras sessões e devolve um token NOVO
// para este dispositivo seguir logado (guardar via authStore.setToken).
export const alterarSenha = (dados) => api.post('/auth/alterar-senha', dados)
// Derruba TODAS as sessões (inclusive a atual — exige novo login depois).
export const logoutAll = () => api.post('/auth/logout-all')
