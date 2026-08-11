import { family } from '../theme/fonts.js'

/**
 * Marca Quantum — reproduz a geometria exata do `public/brand/logo-mark.svg`
 * do app (quadrado com entalhe). `color` = cor do traço; `notch` = cor do
 * entalhe interno (deve casar com o fundo). Wordmark opcional.
 */
export function LogoMark({ size = 96, color = '#051125', notch = '#F8F9FA' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Quantum">
      <rect x="6" y="6" width="108" height="108" fill="none" stroke={color} strokeWidth="14" />
      <rect x="74" y="74" width="40" height="40" fill={color} />
      <rect x="92" y="92" width="22" height="22" fill={notch} />
    </svg>
  )
}

export function LogoLockup({ size = 96, color = '#051125', notch = '#F8F9FA', wordColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.28 }}>
      <LogoMark size={size} color={color} notch={notch} />
      <span
        style={{
          fontFamily: family.serif,
          fontWeight: 700,
          fontSize: size * 0.92,
          letterSpacing: '-0.03em',
          color: wordColor || color,
        }}
      >
        Quantum
      </span>
    </div>
  )
}
