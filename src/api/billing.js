import api from './client'

export const billingStatus = () => api.get('/billing/status')
export const criarCheckout = () => api.post('/billing/checkout')
export const abrirPortal = () => api.post('/billing/portal')
