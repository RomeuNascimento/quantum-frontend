import { Composition } from 'remotion'
import { DemoAd } from './videos/DemoAd.jsx'
import { FPS, FORMATS, totalDurationInFrames } from './config/video.config.js'
import { waitForFonts } from './theme/fonts.js'

/**
 * Registro das composições. Cada `<Composition>` vira um vídeo no Studio.
 *
 * • DemoAd        → 1080×1920 (9:16) — formato principal
 * • DemoAdSquare  → 1080×1080 (1:1)  — mesma peça, fácil de adaptar
 *
 * Os vídeos 2 (ProblemSolutionAd) e 3 (ProductShowcaseAd) serão registrados
 * aqui nas próximas etapas.
 */
export function RemotionRoot() {
  const duration = totalDurationInFrames()

  return (
    <>
      <Composition
        id="DemoAd"
        component={DemoAd}
        durationInFrames={duration}
        fps={FPS}
        width={FORMATS.vertical.width}
        height={FORMATS.vertical.height}
        calculateMetadata={async () => {
          await waitForFonts()
          return {}
        }}
      />

      <Composition
        id="DemoAdSquare"
        component={DemoAd}
        durationInFrames={duration}
        fps={FPS}
        width={FORMATS.square.width}
        height={FORMATS.square.height}
        calculateMetadata={async () => {
          await waitForFonts()
          return {}
        }}
      />
    </>
  )
}
