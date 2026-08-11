import { useCurrentFrame, useVideoConfig } from 'remotion'
import { family } from '../theme/fonts.js'
import { colors } from '../theme/tokens.js'
import { enterUp, springs } from '../theme/anim.js'

/**
 * Kicker (sobrancelha) — rótulo mono uppercase, igual ao `.eyebrow` do app.
 */
export function Kicker({ children, color = colors.secondary, delay = 0, align = 'left' }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const st = enterUp(frame, fps, delay, 18)
  return (
    <div
      style={{
        fontFamily: family.mono,
        fontSize: 26,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color,
        textAlign: align,
        ...st,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Título serifado (Playfair) com entrada linha-a-linha em stagger.
 * `text` pode conter "\n" para quebrar em linhas animadas separadamente.
 */
export function Headline({
  text,
  color = colors.primary,
  size = 96,
  weight = 700,
  delay = 0,
  align = 'left',
  lineStagger = 7,
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const lines = String(text).split('\n')
  return (
    <div style={{ textAlign: align }}>
      {lines.map((ln, i) => {
        const st = enterUp(frame, fps, delay + i * lineStagger, 52, springs.pop)
        return (
          <div
            key={i}
            style={{
              fontFamily: family.serif,
              fontWeight: weight,
              fontSize: size,
              lineHeight: 1.04,
              letterSpacing: '-0.02em',
              color,
              ...st,
            }}
          >
            {ln}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Linha de apoio (Work Sans).
 */
export function Sub({ children, color = colors.onSurfaceDim, size = 34, delay = 0, align = 'left', weight = 500 }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const st = enterUp(frame, fps, delay, 30)
  return (
    <div
      style={{
        fontFamily: family.sans,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.3,
        color,
        textAlign: align,
        ...st,
      }}
    >
      {children}
    </div>
  )
}
