import { AbsoluteFill } from 'remotion'

/** Centraliza os filhos no canvas (flex center). */
export function Stage({ children, style, justify = 'center', align = 'center' }) {
  return (
    <AbsoluteFill style={{ justifyContent: justify, alignItems: align, ...style }}>{children}</AbsoluteFill>
  )
}

/** Posiciona o celular no palco com escala e deslocamento vertical. */
export function PhonePlacement({ children, scale = 1.5, y = 0 }) {
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ transform: `translateY(${y}px) scale(${scale})`, transformOrigin: 'center center' }}>{children}</div>
    </AbsoluteFill>
  )
}
