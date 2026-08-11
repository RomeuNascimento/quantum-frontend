import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { Background } from '../components/Background.jsx'
import { PhoneFrame } from '../components/PhoneFrame.jsx'
import { AnimatedCursor } from '../components/AnimatedCursor.jsx'
import { RecipeReview } from '../screens/RecipeReview.jsx'
import { PriceScreen, SLIDER } from '../screens/PriceScreen.jsx'
import { colors } from '../theme/tokens.js'
import { family } from '../theme/fonts.js'
import { springs, s01, enterUp } from '../theme/anim.js'
import { PRODUCT, precoDe, lucroDe, COPY_PROBLEMA, SPEED } from '../config/video.config.js'

/**
 * Demonstração COMPACTA (Vídeo 2): um celular resolve o problema rápido —
 * a IA mostra a receita organizada e o preço aparece com o slider. Reusa as
 * telas do app. Duração vem do <Sequence> pai.
 */
export function CompactDemo() {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const split = Math.round(durationInFrames * 0.4)
  const onPrice = frame >= split
  const since = frame - (onPrice ? split : 0)

  // entrada do celular
  const enterP = s01(frame, fps, 0, springs.gentle)
  const phoneY = interpolate(enterP, [0, 1], [140, 0])
  const phoneScale = interpolate(enterP, [0, 1], [0.92, 1])
  const tilt = interpolate(enterP, [0, 1], [8, 0])

  // ingredientes staggering na fase receita
  const visibleCount = Math.round(
    interpolate(frame * SPEED, [6, split - 6], [0, PRODUCT.ingredients.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  )

  // slider drag na fase preço
  const dragFrom = split + 10
  const dragTo = split + Math.round((durationInFrames - split) * 0.7)
  const margem = interpolate(frame, [dragFrom, dragTo], [PRODUCT.margemInicial, PRODUCT.margemAlvo], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // zoom-in no card de preço
  const zoom = interpolate(frame, [split + 2, dragFrom], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const camScale = 1 + 0.02 * enterP + 0.14 * zoom
  const camY = -120 * zoom

  const caption = onPrice ? COPY_PROBLEMA.demoCalcula : COPY_PROBLEMA.demoManda
  const capSt = enterUp(since, fps, 2, 24)

  return (
    <AbsoluteFill>
      <Background variant="light" />

      {/* legenda */}
      <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: 92 }}>
        <div
          style={{
            display: 'inline-block',
            background: colors.primary,
            color: colors.onPrimary,
            borderRadius: 999,
            padding: '16px 32px',
            fontFamily: family.sans,
            fontWeight: 600,
            fontSize: 36,
            ...capSt,
          }}
        >
          {caption}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `translateY(${phoneY + camY}px) scale(${phoneScale * camScale})`, transformOrigin: 'center 42%' }}>
          <PhoneFrame scale={1.46} tilt={tilt}>
            {onPrice ? (
              <SlideIn since={since}>
                <PriceScreen margem={margem} preco={precoDe(margem)} lucro={lucroDe(margem)} />
              </SlideIn>
            ) : (
              <RecipeReview visibleCount={visibleCount} />
            )}
            {onPrice && (
              <AnimatedCursor
                keyframes={[
                  { x: 215, y: 620, at: split },
                  { x: SLIDER.thumbX(PRODUCT.margemInicial), y: SLIDER.y, at: dragFrom },
                  { x: SLIDER.thumbX(PRODUCT.margemAlvo), y: SLIDER.y, at: dragTo },
                ]}
                clicks={[dragFrom + 1]}
              />
            )}
          </PhoneFrame>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

function SlideIn({ since, children }) {
  const p = interpolate(since, [0, 9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ transform: `translateX(${interpolate(p, [0, 1], [40, 0])}px)`, opacity: p, background: colors.surface }}>
      {children}
    </AbsoluteFill>
  )
}
