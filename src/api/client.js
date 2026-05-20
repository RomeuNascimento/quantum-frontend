import axios from 'axios'
import useAuthStore from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.quantumcalc.com.br',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('quantum_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const { token, logout } = useAuthStore.getState()
      // Só faz logout se havia uma sessão ativa.
      // Evita interferir com erros de credenciais na tela de login.
      if (token) logout()
      // Sem window.location.href — o PrivateRoute detecta token: null
      // e faz <Navigate to="/login"> via React Router (sem reload de página).
    }
    const msg = error.response?.data?.detail || 'Erro ao conectar com o servidor'
    return Promise.reject(new Error(msg))
  },
)

export default api
