import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { Background } from '../components/Background.jsx'
import { PriceRevealCard } from '../components/PriceRevealCard.jsx'
import { Kicker, Headline } from '../components/AnimatedText.jsx'
import { colors } from '../theme/tokens.js'
import { springs, s01, tween } from '../theme/anim.js'
import { COPY, PRODUCT, precoDe, lucroDe, SPEED } from '../config/video.config.js'

/**
 * GANCHO (0–2,4s): faz a pergunta que aperta a confeiteira ("Quanto cobrar?")
 * e responde na hora com o card de preço subindo — o número mais interessante
 * do app. Pergunta → resposta em 2 segundos.
 */
export function HookScene() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // A pergunta domina o começo; depois sobe e encolhe para dar lugar ao card.
  const handoff = 0.42 * durationInFrames // ~1s
  const qShift = tween(frame, [handoff - 6, handoff + 14], [0, -320])
  const qScale = tween(frame, [handoff - 6, handoff + 14], [1, 0.62])

  // Card entra de baixo com pop.
  const cardP = s01(frame, fps, handoff, springs.pop)
  const cardY = interpolate(cardP, [0, 1], [520, 0])
  const cardOp = interpolate(cardP, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' })

  // Preço conta de 0 até o valor final enquanto o card sobe.
  const countT = interpolate((frame - handoff) * SPEED, [6, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const preco = precoDe(PRODUCT.margemAlvo) * countT
  const margem = PRODUCT.margemAlvo * countT
  const lucro = lucroDe(PRODUCT.margemAlvo) * countT

  return (
    <AbsoluteFill>
      <Background variant="navy" />

      {/* Pergunta */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 90px' }}>
        <div style={{ transform: `translateY(${qShift}px) scale(${qScale})`, textAlign: 'center' }}>
          <div style={{ marginBottom: 22 }}>
            <Kicker color={colors.accentSoft} align="center">
              {COPY.hook.kicker}
            </Kicker>
          </div>
          <Headline text={COPY.hook.line} color={colors.onPrimary} size={104} align="center" lineStagger={6} />
        </div>
      </AbsoluteFill>

      {/* Card resposta */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 210 }}>
        <div style={{ transform: `translateY(${cardY}px)`, opacity: cardOp }}>
          <PriceRevealCard preco={preco} margem={margem} lucro={lucro} name={PRODUCT.name} width={820} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
