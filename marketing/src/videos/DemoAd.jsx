import { AbsoluteFill, Sequence } from 'remotion'
import { HookScene } from '../scenes/HookScene.jsx'
import { AppSequence } from '../scenes/AppSequence.jsx'
import { ResultScene } from '../scenes/ResultScene.jsx'
import { CtaScene } from '../scenes/CtaScene.jsx'
import { colors } from '../theme/tokens.js'
import { TIMELINE, sec } from '../config/video.config.js'

/**
 * VÍDEO 1 — DEMONSTRAÇÃO RÁPIDA.
 * Gancho → interface entra → uso simulado (cursor, digitação, IA, slider) →
 * resultado → CTA. Cada bloco é um <Sequence> cuja duração vem do TIMELINE
 * central (edite lá). As trocas usam um leve zoom-out/zoom-in para dar corte
 * cinematográfico entre cenas de fundo diferente.
 */
export function DemoAd() {
  const hook = sec(TIMELINE.hook)
  const app = sec(TIMELINE.intro) + sec(TIMELINE.demoUpload) + sec(TIMELINE.demoParsed) + sec(TIMELINE.demoPrice)
  const result = sec(TIMELINE.result)
  const cta = sec(TIMELINE.cta)

  let t = 0
  const at = (dur) => {
    const from = t
    t += dur
    return { from, durationInFrames: dur }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: colors.surface }}>
      <Sequence {...at(hook)} name="1 · Gancho">
        <HookScene />
      </Sequence>
      <Sequence {...at(app)} name="2 · App (uso simulado)">
        <AppSequence />
      </Sequence>
      <Sequence {...at(result)} name="3 · Resultado">
        <ResultScene />
      </Sequence>
      <Sequence {...at(cta)} name="4 · CTA">
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  )
}
