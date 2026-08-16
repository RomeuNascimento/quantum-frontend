import api from './client'

// mes: "YYYY-MM" (opcional — sem ele o backend usa o mês atual)
export const listarLancamentos = (mes) =>
  api.get('/financeiro/lancamentos', { params: mes ? { mes } : {} })
export const criarLancamento = (dados) => api.post('/financeiro/lancamentos', dados)
export const deletarLancamento = (id) => api.delete(`/financeiro/lancamentos/${id}`)
export const resumoFinanceiro = (mes) =>
  api.get('/financeiro/resumo', { params: mes ? { mes } : {} })

// IA: texto livre → { lancamentos: [{tipo, valor, descricao, categoria, data}] }
export const interpretarLancamento = (texto) =>
  api.post('/ia/interpretar-lancamento', { texto })

// IA: foto/print de comprovante (Pix etc.) → { lancamento: {...} }
export const lerComprovante = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/ia/comprovante', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}
