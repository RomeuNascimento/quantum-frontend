import { useCurrentFrame, interpolate } from 'remotion'
import { colors } from '../theme/tokens.js'

/**
 * Realça um elemento da UI: desenha um anel dourado animado ao redor de um
 * retângulo (x,y,w,h em px, relativo ao container) que "respira". Usado para
 * dirigir a atenção a um botão, número ou campo importante.
 *
 * props:
 *  rect  : { x, y, w, h }
 *  start : frame em que aparece
 *  radius: raio do canto (default 18)
 *  pad   : folga ao redor do alvo (default 8)
 */
export function FeatureHighlight({ rect, start = 0, radius = 18, pad = 8, color = colors.accent }) {
  const frame = useCurrentFrame()
  const d = frame - start
  if (d < 0) return null

  const appear = interpolate(d, [0, 10], [0, 1], { extrapolateRight: 'clamp' })
  const breathe = 1 + Math.sin(d / 9) * 0.02
  const glow = 0.35 + Math.sin(d / 9) * 0.15

  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x - pad,
        top: rect.y - pad,
        width: rect.w + pad * 2,
        height: rect.h + pad * 2,
        borderRadius: radius,
        border: `3px solid ${color}`,
        boxShadow: `0 0 0 6px rgba(165,101,43,${glow * 0.25}), 0 0 24px rgba(165,101,43,${glow})`,
        transform: `scale(${appear * breathe})`,
        opacity: appear,
        zIndex: 55,
        pointerEvents: 'none',
      }}
    />
  )
}
