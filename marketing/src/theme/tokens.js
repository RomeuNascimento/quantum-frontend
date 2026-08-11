/**
 * Design tokens do Quantum — espelhados de `tailwind.config.js` + `src/index.css`
 * do app (identidade "Kitchen Metrics · Soft Minimalist": navy / slate / dourado).
 *
 * Mantidos aqui para que os vídeos usem EXATAMENTE as mesmas cores do produto.
 * Se a paleta do app mudar, atualize este arquivo.
 */
export const colors = {
  surface: '#F8F9FA', // fundo base (canvas)
  surface1: '#F3F4F5', // inputs / seções rebaixadas
  surface2: '#EDEEEF', // containers sutis
  card: '#FFFFFF', // superfície de card (branco)
  onSurface: '#191C1D', // texto principal
  onSurfaceDim: '#45474D', // texto secundário
  outline: '#DEE2E6', // bordas estruturais
  outlineStrong: '#C5C6CD',
  primary: '#051125', // navy — nav, títulos, ênfase
  onPrimary: '#FFFFFF',
  primarySoft: '#1B263B',
  secondary: '#47607E', // slate — dados de apoio
  accent: '#A5652B', // dourado/terracota — ações/realces
  accentSoft: '#F9BA77', // dourado claro
  onAccent: '#FFFFFF',
  positive: '#3F7D5B', // verde-sálvia — status saudável
  positiveBg: '#DCEEE3',
  info: '#C2DCFF', // azul-claro — badge saudável
  onInfo: '#2F4865',
  warm: '#FFDCBB', // pêssego — badge atenção
  onWarm: '#673D02',
  danger: '#BA1A1A', // erro / valor negativo
  dangerBg: '#FFDAD6',
  onDangerBg: '#93000A',
}

export const fonts = {
  // Carregadas via @remotion/google-fonts em src/theme/fonts.js
  serif: 'Playfair Display, Georgia, serif', // títulos
  sans: 'Work Sans, system-ui, sans-serif', // UI / corpo
  mono: 'JetBrains Mono, ui-monospace, monospace', // números / labels
}

export const radius = {
  xl: 16, // rounded-xl (cards, inputs) — 0.75rem≈12; app usa 0.75rem default, xl=16
  lg: 12,
  full: 9999, // botões, FAB, badges
}

// Sombra suave usada nos mockups/telas flutuantes (o app é sem sombra, mas o
// vídeo precisa de profundidade para não parecer screenshot chapado).
export const shadow = {
  float: '0 40px 80px -20px rgba(5, 17, 37, 0.35), 0 12px 30px -12px rgba(5,17,37,0.25)',
  soft: '0 20px 40px -16px rgba(5, 17, 37, 0.25)',
  card: '0 8px 24px -10px rgba(5, 17, 37, 0.18)',
}
