import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { colors } from '../theme/tokens.js'
import { tween } from '../theme/anim.js'

/**
 * Fundo de cena — gradiente sutil + grade de precisão + "spotlight" que
 * deriva devagar (dá vida sem distrair). Duas variantes: 'light' (surface) e
 * 'navy' (primary). O leve movimento evita a sensação de screenshot parado.
 */
export function Background({ variant = 'light', drift = true }) {
  const frame = useCurrentFrame()
  const dark = variant === 'navy'
  const base = dark ? colors.primary : colors.surface
  const glow = dark ? colors.primarySoft : '#FFFFFF'

  const gx = drift ? tween(frame, [0, 300], [35, 65]) : 50
  const gy = drift ? tween(frame, [0, 300], [30, 42]) : 34

  return (
    <AbsoluteFill style={{ backgroundColor: base }}>
      {/* Spotlight radial que deriva */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at ${gx}% ${gy}%, ${glow} 0%, ${base} 62%)`,
          opacity: dark ? 0.55 : 0.9,
        }}
      />
      {/* Grade de precisão (a "identidade instrumento") */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${
            dark ? 'rgba(255,255,255,0.05)' : 'rgba(5,17,37,0.045)'
          } 1px, transparent 1px), linear-gradient(90deg, ${
            dark ? 'rgba(255,255,255,0.05)' : 'rgba(5,17,37,0.045)'
          } 1px, transparent 1px)`,
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(120% 90% at 50% 40%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(120% 90% at 50% 40%, black 30%, transparent 80%)',
        }}
      />
    </AbsoluteFill>
  )
}
