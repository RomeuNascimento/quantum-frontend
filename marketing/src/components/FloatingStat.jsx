import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { family } from '../theme/fonts.js'
import { colors, shadow } from '../theme/tokens.js'
import { springs, s01 } from '../theme/anim.js'

/**
 * "Pílula de dado" flutuante — um número/rótulo que sai da UI e paira com leve
 * deriva (profundidade). Usada no Product Showcase para destacar dados.
 *
 * props:
 *  value    : número grande (ex "70%", "R$ 5,00")
 *  label    : rótulo pequeno em cima (mono uppercase)
 *  delay    : frame de entrada
 *  variant  : 'gold' | 'navy' | 'light'
 *  drift    : amplitude do balanço (px)
 */
export function FloatingStat({ value, label, delay = 0, variant = 'light', drift = 10 }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = s01(frame, fps, delay, springs.pop)
  const y = interpolate(p, [0, 1], [40, 0]) + Math.sin((frame - delay) / 18) * drift
  const op = interpolate(p, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' })

  const styles = {
    gold: { bg: colors.accentSoft, fg: colors.primary, sub: 'rgba(5,17,37,0.6)' },
    navy: { bg: colors.primary, fg: colors.accentSoft, sub: 'rgba(255,255,255,0.6)' },
    light: { bg: colors.card, fg: colors.primary, sub: colors.secondary },
  }[variant]

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 4,
        background: styles.bg,
        borderRadius: 22,
        padding: '20px 30px',
        boxShadow: shadow.float,
        transform: `translateY(${y}px) scale(${interpolate(p, [0, 1], [0.85, 1])})`,
        opacity: op,
      }}
    >
      {label ? (
        <span style={{ fontFamily: family.mono, fontSize: 18, letterSpacing: '0.12em', textTransform: 'uppercase', color: styles.sub }}>
          {label}
        </span>
      ) : null}
      <span style={{ fontFamily: family.mono, fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 56, lineHeight: 1, color: styles.fg }}>
        {value}
      </span>
    </div>
  )
}
