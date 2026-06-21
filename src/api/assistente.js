import api from './client'

// Grava o produto inteiro montado no assistente (ingredientes + preços + receita
// + produto + precificação) numa transação só. Devolve { produto_id, receita_id }.
export const salvarAssistente = (payload) => api.post('/assistente/salvar', payload)
