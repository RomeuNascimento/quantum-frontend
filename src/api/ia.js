import api from './client'

export const processarNotaFiscal = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/ia/nota-fiscal', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export const processarReceitas = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/ia/receitas', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}
