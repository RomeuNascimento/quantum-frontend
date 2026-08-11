import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { Background } from '../components/Background.jsx'
import { PhoneFrame } from '../components/PhoneFrame.jsx'
import { Camera } from '../components/Camera.jsx'
import { AnimatedCursor } from '../components/AnimatedCursor.jsx'
import { FeatureHighlight } from '../components/FeatureHighlight.jsx'
import { Kicker } from '../components/AnimatedText.jsx'
import { AssistenteHome, HOME_CTA_RECT } from '../screens/AssistenteHome.jsx'
import { RecipeUpload } from '../screens/RecipeUpload.jsx'
import { RecipeReview } from '../screens/RecipeReview.jsx'
import { PriceScreen, SLIDER } from '../screens/PriceScreen.jsx'
import { Processing } from '../screens/Processing.jsx'
import { colors } from '../theme/tokens.js'
import { family } from '../theme/fonts.js'
import { springs, s01, enterUp } from '../theme/anim.js'
import { TIMELINE, COPY, PRODUCT, precoDe, lucroDe, sec, SPEED } from '../config/video.config.js'

/**
 * O CORAÇÃO do vídeo (2,4–13,6s): um ÚNICO celular que permanece em cena
 * enquanto "alguém usa o app" — cursor navegando, clique com feedback, receita
 * sendo digitada, IA organizando os ingredientes e o slider de margem revelando
 * o preço ao vivo. Continuidade real entre telas (nada de slideshow).
 */

// Durações (frames) — derivadas do TIMELINE central.
const D = {
  intro: sec(TIMELINE.intro),
  upload: sec(TIMELINE.demoUpload),
  parsed: sec(TIMELINE.demoParsed),
  price: sec(TIMELINE.demoPrice),
}
export const APP_SEQ_FRAMES = D.intro + D.upload + D.parsed + D.price

// Marcos (frame local da sequência)
const uploadStart = D.intro
const procStart = D.intro + D.upload - 14
const parsedStart = D.intro + D.upload
const priceStart = D.intro + D.upload + D.parsed

// Janela do "arraste" do slider (frames locais) — cursor e preço usam a MESMA.
const dragFrom = priceStart + 16
const dragTo = priceStart + 58

// Texto completo "digitado" na etapa de upload
const RECIPE_TEXT = 'Bolo de cenoura: 3 ovos, 2 xíc de açúcar, 1 xíc de óleo, 3 cenouras, 2 xíc de farinha, 200g de chocolate'

export function AppSequence() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // ── Entrada do celular (só no começo) ──
  const enterP = s01(frame, fps, 0, springs.gentle)
  const phoneY = interpolate(enterP, [0, 1], [180, 0])
  const phoneScaleIn = interpolate(enterP, [0, 1], [0.9, 1])
  const phoneTilt = interpolate(enterP, [0, 1], [10, 0])

  // ── Qual tela está ativa + quando trocou (para o slide-in) ──
  let scene = 'home'
  let switchAt = 0
  if (frame >= priceStart) {
    scene = 'price'
    switchAt = priceStart
  } else if (frame >= parsedStart) {
    scene = 'parsed'
    switchAt = parsedStart
  } else if (frame >= procStart) {
    scene = 'processing'
    switchAt = procStart
  } else if (frame >= uploadStart) {
    scene = 'upload'
    switchAt = uploadStart
  }
  const since = frame - switchAt

  // ── Props animadas por tela ──
  // Typing (upload)
  const typeChars = Math.round(
    interpolate((frame - (uploadStart + 6)) * SPEED, [0, 32], [0, RECIPE_TEXT.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  )
  const typedText = RECIPE_TEXT.slice(0, typeChars)
  const typing = frame > uploadStart + 4 && frame < uploadStart + 40

  // Stagger dos ingredientes (parsed)
  const visibleCount = Math.round(
    interpolate((frame - (parsedStart + 4)) * SPEED, [0, 36], [0, PRODUCT.ingredients.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  )

  // Margem/preço ao vivo (price)
  const margem = interpolate(frame, [dragFrom, dragTo], [PRODUCT.margemInicial, PRODUCT.margemAlvo], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const preco = precoDe(margem)
  const lucro = lucroDe(margem)

  // ── Câmera: leve push-in geral + zoom no slider na hora do preço ──
  const zoomToSlider = interpolate(frame, [priceStart + 4, dragFrom], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const zoomBack = interpolate(frame, [dragTo + 10, dragTo + 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const sliderZoom = zoomToSlider * (1 - zoomBack)
  const camScale = 1 + 0.02 * s01(frame, fps, 0) + 0.16 * sliderZoom
  const camY = -140 * sliderZoom // sobe para enquadrar o card de preço

  // ── Cursor (coordenadas na tela do device 430×932) ──
  const cursorKeys = [
    { x: 330, y: 660, at: uploadStart - 30 }, // aparece (canto)
    { x: (HOME_CTA_RECT.x + HOME_CTA_RECT.w / 2), y: HOME_CTA_RECT.y + HOME_CTA_RECT.h / 2, at: uploadStart - 6 }, // CTA
    { x: 215, y: 706, at: uploadStart + 12 }, // textarea
    { x: 215, y: 843, at: uploadStart + 54 }, // botão "Ler minha receita"
    { x: 215, y: 862, at: parsedStart + D.parsed - 14 }, // botão "Confirmar receita"
    { x: SLIDER.thumbX(PRODUCT.margemInicial), y: SLIDER.y, at: dragFrom }, // pega o thumb
    { x: SLIDER.thumbX(PRODUCT.margemAlvo), y: SLIDER.y, at: dragTo }, // arrasta
  ]
  const cursorClicks = [
    uploadStart - 2, // clique no CTA
    uploadStart + 58, // clique em "Ler receita"
    parsedStart + D.parsed - 8, // clique em "Confirmar"
    dragFrom + 1, // "pega" o slider
  ]

  return (
    <AbsoluteFill>
      <Background variant="light" />

      {/* Legenda curta da ação (topo) */}
      <SceneCaption scene={scene} since={since} frame={frame} />

      {/* Palco do celular com câmera */}
      <Camera from={{ scale: 1 }} to={{ scale: 1 }}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div
            style={{
              transform: `translateY(${phoneY + camY}px) scale(${phoneScaleIn * camScale})`,
              transformOrigin: 'center 42%',
            }}
          >
            <PhoneFrame scale={1.48} tilt={phoneTilt}>
              {/* Tela ativa com slide-in na troca */}
              <ScreenSwap scene={scene} since={since}>
                {scene === 'home' && <AssistenteHome />}
                {scene === 'upload' && <RecipeUpload typedText={typedText} caret={typing} />}
                {scene === 'processing' && <Processing />}
                {scene === 'parsed' && <RecipeReview visibleCount={visibleCount} />}
                {scene === 'price' && <PriceScreen margem={margem} preco={preco} lucro={lucro} />}
              </ScreenSwap>

              {/* Realces */}
              {scene === 'home' && frame > uploadStart - 20 && frame < uploadStart && (
                <FeatureHighlight rect={HOME_CTA_RECT} start={uploadStart - 18} radius={16} />
              )}
              {scene === 'price' && frame > dragTo + 4 && (
                <FeatureHighlight rect={{ x: 36, y: 222, w: 300, h: 82 }} start={dragTo + 4} radius={14} />
              )}

              {/* Cursor por cima de tudo */}
              <AnimatedCursor keyframes={cursorKeys} clicks={cursorClicks} />
            </PhoneFrame>
          </div>
        </AbsoluteFill>
      </Camera>
    </AbsoluteFill>
  )
}

/** Slide-in curto da tela quando o app "navega" (motivado pelo clique). */
function ScreenSwap({ scene, since, children }) {
  // Home usa a entrada do celular; demais telas deslizam.
  if (scene === 'home') return <AbsoluteFill>{children}</AbsoluteFill>
  const p = interpolate(since, [0, 9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const x = interpolate(p, [0, 1], [46, 0])
  const op = interpolate(p, [0, 1], [0, 1])
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)`, opacity: op, background: colors.surface }}>
      {children}
    </AbsoluteFill>
  )
}

/** Legenda curta no topo, uma por beat. */
function SceneCaption({ scene, since, frame }) {
  const map = {
    home: COPY.intro.headline,
    upload: COPY.demo.upload,
    processing: COPY.demo.parsed,
    parsed: COPY.demo.parsed,
    price: COPY.demo.price,
  }
  const text = map[scene] || ''
  const st = enterUp(since, 30, 2, 26)

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: 96 }}>
      <div style={{ textAlign: 'center', padding: '0 80px', ...st }}>
        {scene === 'home' ? (
          <div
            style={{
              fontFamily: family.serif,
              fontWeight: 700,
              fontSize: 60,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: colors.primary,
            }}
          >
            {String(text).split('\n').map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'inline-block',
              background: colors.primary,
              color: colors.onPrimary,
              borderRadius: 999,
              padding: '16px 30px',
              fontFamily: family.sans,
              fontWeight: 600,
              fontSize: 34,
            }}
          >
            {text}
          </div>
        )}
      </div>
    </AbsoluteFill>
  )
}
