// Contato do suporte. Valores padrão embutidos; dá pra sobrescrever no EasyPanel
// com VITE_SUPORTE_WHATSAPP (só dígitos, com DDI+DDD) e VITE_SUPORTE_EMAIL.

// wa.me exige só dígitos, com DDI. 55 (Brasil) + DDD + número.
export const SUPORTE_WHATSAPP =
  (import.meta.env.VITE_SUPORTE_WHATSAPP || '5591982368453').replace(/\D/g, '')

export const SUPORTE_EMAIL =
  import.meta.env.VITE_SUPORTE_EMAIL || 'suporte@quantumcalc.com.br'

// Exibe o número bonitinho: 55 91 98236-8453 -> (91) 98236-8453
export function whatsappFormatado(digitos = SUPORTE_WHATSAPP) {
  const d = digitos.replace(/\D/g, '')
  const local = d.startsWith('55') ? d.slice(2) : d // tira o DDI
  if (local.length < 10) return digitos
  const ddd = local.slice(0, 2)
  const resto = local.slice(2)
  const meio = resto.length === 9 ? resto.slice(0, 5) : resto.slice(0, 4)
  const fim = resto.length === 9 ? resto.slice(5) : resto.slice(4)
  return `(${ddd}) ${meio}-${fim}`
}
