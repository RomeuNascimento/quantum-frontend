import axios from 'axios'
import useAuthStore from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.quantumcalc.com.br',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (!navigator.onLine && config.method !== 'get') {
    return Promise.reject(new Error('Sem conexão. Tente novamente quando estiver online.'))
  }
  const token = localStorage.getItem('quantum_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 402) {
      window.location.href = '/assinatura'
      return Promise.reject(new Error('Assinatura necessária'))
    }
    if (error.response?.status === 401) {
      const { token, logout } = useAuthStore.getState()
      // Só faz logout se havia uma sessão ativa.
      // Evita interferir com erros de credenciais na tela de login.
      if (token) logout()
      // Sem window.location.href — o PrivateRoute detecta token: null
      // e faz <Navigate to="/login"> via React Router (sem reload de página).
    }
    // Em erros 422 do FastAPI, detail é um array de objetos de validação —
    // sem normalizar, a UI exibiria "[object Object]"
    let msg = error.response?.data?.detail || 'Erro ao conectar com o servidor'
    if (Array.isArray(msg)) {
      msg = msg
        .map((e) => {
          const campo = (e.loc || []).filter((p) => p !== 'body').join('.')
          return campo ? `${campo}: ${e.msg}` : e.msg
        })
        .join('; ')
    } else if (typeof msg !== 'string') {
      msg = JSON.stringify(msg)
    }
    return Promise.reject(new Error(msg))
  },
)

export default api
