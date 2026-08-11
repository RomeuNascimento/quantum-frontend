/**
 * Presets de animação — spring natural, ease-out, e helpers de entrada.
 * Centraliza a "sensação" do motion para todos os vídeos ficarem coerentes.
 */
import { spring, interpolate, Easing } from 'remotion'
import { SPEED } from '../config/video.config.js'

// Spring "UI suave": firme, sem balanço exagerado (escala 0.95 → 1, ease-out natural).
export const springs = {
  soft: { damping: 200, stiffness: 120, mass: 0.9 },
  pop: { damping: 18, stiffness: 180, mass: 0.7 }, // leve overshoot para "entrada com vida"
  gentle: { damping: 200, stiffness: 80, mass: 1 },
  snappy: { damping: 26, stiffness: 260, mass: 0.6 },
}

// Spring normalizado 0→1, respeitando a velocidade global (SPEED).
export const s01 = (frame, fps, delay = 0, preset = springs.soft) =>
  spring({
    frame: (frame - delay) * SPEED,
    fps,
    config: preset,
    durationInFrames: undefined,
  })

// Entrada padrão: sobe + fade + escala 0.95→1. Retorna { opacity, transform }.
export const enterUp = (frame, fps, delay = 0, dist = 40, preset = springs.soft) => {
  const p = s01(frame, fps, delay, preset)
  return {
    opacity: interpolate(p, [0, 1], [0, 1], { extrapolateRight: 'clamp' }),
    transform: `translateY(${(1 - p) * dist}px) scale(${interpolate(p, [0, 1], [0.95, 1])})`,
  }
}

// Fade puro (usar com parcimônia — a direção pediu para evitar fade em tudo).
export const fadeIn = (frame, fps, delay = 0, dur = 8) =>
  interpolate((frame - delay) * SPEED, [0, dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

// Ease-out cúbico para movimentos de câmera / trajetórias.
export const easeOut = (t) => Easing.out(Easing.cubic)(t)

// Interpola respeitando SPEED (encolhe o eixo de tempo).
export const tween = (frame, inputRange, outputRange, opts = {}) =>
  interpolate(
    frame * SPEED,
    inputRange,
    outputRange,
    { easing: easeOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp', ...opts }
  )
