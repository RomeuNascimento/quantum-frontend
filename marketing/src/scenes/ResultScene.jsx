import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { Background } from '../components/Background.jsx'
import { PriceRevealCard } from '../components/PriceRevealCard.jsx'
import { Headline, Sub } from '../components/AnimatedText.jsx'
import { colors } from '../theme/tokens.js'
import { springs, s01 } from '../theme/anim.js'
import { COPY, PRODUCT, precoDe, lucroDe } from '../config/video.config.js'

/**
 * RESULTADO (13,6–16,2s): o benefício. O card de preço "salvo" volta em
 * destaque com a frase de valor. Fecha o arco pergunta→uso→resultado.
 */
export function ResultScene({ title = COPY.result.title, sub = COPY.result.sub }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const cardP = s01(frame, fps, 8, springs.pop)
  const cardScale = interpolate(cardP, [0, 1], [0.9, 1])
  const cardOp = interpolate(cardP, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill>
      <Background variant="light" />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '0 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <Headline text={title} color={colors.primary} size={92} align="center" lineStagger={7} />
          <div style={{ marginTop: 22 }}>
            <Sub align="center" size={36} delay={14}>
              {sub}
            </Sub>
          </div>
        </div>
        <div style={{ transform: `scale(${cardScale})`, opacity: cardOp }}>
          <PriceRevealCard
            preco={precoDe(PRODUCT.margemAlvo)}
            margem={PRODUCT.margemAlvo}
            lucro={lucroDe(PRODUCT.margemAlvo)}
            name={PRODUCT.name}
            width={780}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
