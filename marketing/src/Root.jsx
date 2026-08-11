import { Composition } from 'remotion'
import { DemoAd } from './videos/DemoAd.jsx'
import { ProblemSolutionAd } from './videos/ProblemSolutionAd.jsx'
import { ProductShowcaseAd } from './videos/ProductShowcaseAd.jsx'
import { FPS, FORMATS, TIMELINE, TIMELINE_PROBLEMA, TIMELINE_SHOWCASE, totalOf } from './config/video.config.js'
import { waitForFonts } from './theme/fonts.js'

/**
 * Registro das composições. Cada vídeo é registrado em DOIS formatos:
 *   • vertical 9:16 (1080×1920) — principal
 *   • square   1:1  (1080×1080) — sufixo "Square"
 * Assim a adaptação para 1:1 é automática (o layout usa % e centralização).
 *
 * Para adicionar um vídeo novo, é só incluir uma entrada em VIDEOS.
 */
const VIDEOS = [
  { id: 'DemoAd', component: DemoAd, frames: totalOf(TIMELINE) },
  { id: 'ProblemSolutionAd', component: ProblemSolutionAd, frames: totalOf(TIMELINE_PROBLEMA) },
  { id: 'ProductShowcaseAd', component: ProductShowcaseAd, frames: totalOf(TIMELINE_SHOWCASE) },
]

export function RemotionRoot() {
  return (
    <>
      {VIDEOS.map(({ id, component, frames }) => (
        <Composition
          key={id}
          id={id}
          component={component}
          durationInFrames={frames}
          fps={FPS}
          width={FORMATS.vertical.width}
          height={FORMATS.vertical.height}
          calculateMetadata={async () => {
            await waitForFonts()
            return {}
          }}
        />
      ))}

      {VIDEOS.map(({ id, component, frames }) => (
        <Composition
          key={`${id}Square`}
          id={`${id}Square`}
          component={component}
          durationInFrames={frames}
          fps={FPS}
          width={FORMATS.square.width}
          height={FORMATS.square.height}
          calculateMetadata={async () => {
            await waitForFonts()
            return {}
          }}
        />
      ))}
    </>
  )
}
