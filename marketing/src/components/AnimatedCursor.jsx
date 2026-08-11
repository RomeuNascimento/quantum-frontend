import { useCurrentFrame, interpolate } from 'remotion'
import { easeOut } from '../theme/anim.js'
import { colors } from '../theme/tokens.js'

/**
 * Cursor de toque animado — desloca-se por waypoints com ease-out (desacelera
 * ao chegar), e nos frames de clique dá o feedback: encolhe + dispara um anel
 * (ripple). Movimento NÃO-linear, como pediu a direção.
 *
 * Coordenadas em px, relativas ao container onde o cursor é montado
 * (normalmente a própria tela do app dentro do PhoneFrame).
 *
 * props:
 *  keyframes : [{ x, y, at }]   posições e o frame em que chega em cada uma
 *  clicks    : [frame, ...]     frames em que "toca"
 *  size      : diâmetro base (default 34)
 */
export function AnimatedCursor({ keyframes = [], clicks = [], size = 34 }) {
  const frame = useCurrentFrame()

  // Posição atual: interpola entre os waypoints com ease-out.
  const kf = [...keyframes].sort((a, b) => a.at - b.at)

  // Fade-in: aparece um pouco antes de começar a se mover (nada de cursor parado).
  const firstAt = kf[0]?.at ?? 0
  const appear = interpolate(frame, [firstAt - 10, firstAt], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  if (appear <= 0) return null
  let x = kf[0]?.x ?? 0
  let y = kf[0]?.y ?? 0
  if (kf.length === 1 || frame <= kf[0].at) {
    x = kf[0].x
    y = kf[0].y
  } else if (frame >= kf[kf.length - 1].at) {
    x = kf[kf.length - 1].x
    y = kf[kf.length - 1].y
  } else {
    for (let i = 0; i < kf.length - 1; i++) {
      const a = kf[i]
      const b = kf[i + 1]
      if (frame >= a.at && frame <= b.at) {
        x = interpolate(frame, [a.at, b.at], [a.x, b.x], { easing: easeOut })
        y = interpolate(frame, [a.at, b.at], [a.y, b.y], { easing: easeOut })
        break
      }
    }
  }

  // Feedback de clique mais próximo (encolhe o cursor).
  let press = 0
  for (const c of clicks) {
    const d = frame - c
    if (d >= -3 && d <= 10) press = Math.max(press, interpolate(Math.abs(d), [0, 6], [1, 0], { extrapolateRight: 'clamp' }))
  }
  const cursorScale = 1 - press * 0.28

  return (
    <div style={{ position: 'absolute', left: 0, top: 0, zIndex: 60, pointerEvents: 'none', opacity: appear }}>
      {/* Ripples de clique */}
      {clicks.map((c, i) => {
        const d = frame - c
        if (d < 0 || d > 22) return null
        const t = d / 22
        const r = interpolate(t, [0, 1], [0, 70])
        const op = interpolate(t, [0, 1], [0.5, 0])
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              marginLeft: -r,
              marginTop: -r,
              borderRadius: '50%',
              border: `3px solid ${colors.accent}`,
              opacity: op,
            }}
          />
        )
      })}

      {/* Cursor (fingertip): anel dourado + ponto navy translúcido */}
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          borderRadius: '50%',
          background: 'rgba(5,17,37,0.14)',
          border: `2.5px solid ${colors.card}`,
          boxShadow: `0 6px 16px rgba(5,17,37,0.35), 0 0 0 2px ${colors.accent}`,
          transform: `scale(${cursorScale})`,
        }}
      />
    </div>
  )
}
