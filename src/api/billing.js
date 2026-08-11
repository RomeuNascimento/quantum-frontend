import api from './client'

export const billingStatus = () => api.get('/billing/status')
export const listarPlanos = () => api.get('/billing/planos')
export const criarCheckout = (plano = 'mensal') => api.post('/billing/checkout', { plano })
export const abrirPortal = () => api.post('/billing/portal')
