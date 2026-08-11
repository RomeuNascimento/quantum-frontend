import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { easeOut } from '../theme/anim.js'

/**
 * Câmera virtual — aplica zoom + pan (+ leve rotação/tilt opcional) sobre os
 * filhos, com ease-out natural. Motiva a atenção sem "movimento aleatório".
 *
 * props:
 *  from / to : { scale, x, y, rotate }  — estados inicial e final (px)
 *  startAt / endAt : frames do movimento (default: cena inteira)
 *  origin : transform-origin (default 'center')
 */
export function Camera({
  children,
  from = { scale: 1, x: 0, y: 0, rotate: 0 },
  to = { scale: 1, x: 0, y: 0, rotate: 0 },
  startAt = 0,
  endAt,
  origin = 'center center',
}) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const end = endAt ?? durationInFrames

  const p = interpolate(frame, [startAt, end], [0, 1], {
    easing: easeOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const lerp = (a, b) => a + (b - a) * p
  const scale = lerp(from.scale ?? 1, to.scale ?? 1)
  const x = lerp(from.x ?? 0, to.x ?? 0)
  const y = lerp(from.y ?? 0, to.y ?? 0)
  const rotate = lerp(from.rotate ?? 0, to.rotate ?? 0)

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`,
        transformOrigin: origin,
        willChange: 'transform',
      }}
    >
      {children}
    </AbsoluteFill>
  )
}
