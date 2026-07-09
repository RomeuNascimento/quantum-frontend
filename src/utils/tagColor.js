// Cor determinística por categoria de receita (tipo é texto livre: "Base",
// "Recheio", "Cobertura", "Massa"...). Mesma tag → sempre a mesma cor, para
// o usuário reconhecer de bate-olho. Paleta dentro dos tokens do design system.

const PALETTE = [
  'bg-info text-on-info',            // azul
  'bg-warm text-on-warm',           // pêssego
  'bg-positive-bg text-positive',   // verde-sálvia
  'bg-accent-soft text-primary',    // dourado
  'bg-primary/10 text-primary',     // navy suave
  'bg-secondary/15 text-secondary', // slate
]

export function tagColor(tipo) {
  const s = (tipo || '').toLowerCase().trim()
  if (!s) return PALETTE[0]
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}
