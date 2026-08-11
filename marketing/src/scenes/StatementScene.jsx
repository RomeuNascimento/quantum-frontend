import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { Background } from '../components/Background.jsx'
import { Headline, Kicker } from '../components/AnimatedText.jsx'
import { colors } from '../theme/tokens.js'

/**
 * Cena de FRASE — bloco de texto curto, grande, fácil de ler no celular.
 * Base do Vídeo 2 (Problema → Solução): pergunta, dor, virada.
 *
 * props:
 *  kicker  : sobrancelha opcional
 *  text    : frase (use "\n" para quebrar)
 *  variant : 'navy' | 'light' | 'danger'  (define fundo + cor do texto)
 *  size    : tamanho do título
 *  accent  : palavra/linha destacada em dourado? (índice da linha, opcional)
 */
export function StatementScene({ kicker, text, variant = 'light', size = 108, accentLine = -1 }) {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const dark = variant === 'navy' || variant === 'danger'
  const textColor = variant === 'danger' ? colors.accentSoft : dark ? colors.onPrimary : colors.primary
  const kickerColor = variant === 'danger' ? '#FFB4A6' : dark ? colors.accentSoft : colors.secondary

  // saída suave no fim (para o corte entre frases não ser seco)
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0.9], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const outOp = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const lines = String(text).split('\n')

  return (
    <AbsoluteFill>
      <Background variant={dark ? 'navy' : 'light'} drift />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 84px' }}>
        <div style={{ textAlign: 'center', transform: `scale(${out})`, opacity: outOp }}>
          {kicker ? (
            <div style={{ marginBottom: 26 }}>
              <Kicker color={kickerColor} align="center">
                {kicker}
              </Kicker>
            </div>
          ) : null}
          {/* Título com destaque opcional de uma linha em dourado */}
          <div>
            {lines.map((ln, i) => (
              <Headline
                key={i}
                text={ln}
                color={i === accentLine ? colors.accent : textColor}
                size={size}
                align="center"
                delay={i * 7}
                lineStagger={0}
              />
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
