import axios from 'axios'

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
      localStorage.removeItem('quantum_token')
      window.location.href = '/login'
    }
    const msg = error.response?.data?.detail || 'Erro ao conectar com o servidor'
    return Promise.reject(new Error(msg))
  },
)

export default api
