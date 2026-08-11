import { AbsoluteFill, Sequence } from 'remotion'
import { StatementScene } from '../scenes/StatementScene.jsx'
import { CompactDemo } from '../scenes/CompactDemo.jsx'
import { ResultScene } from '../scenes/ResultScene.jsx'
import { CtaScene } from '../scenes/CtaScene.jsx'
import { colors } from '../theme/tokens.js'
import { TIMELINE_PROBLEMA as T, COPY_PROBLEMA as C, sec } from '../config/video.config.js'

/**
 * VÍDEO 2 — PROBLEMA → SOLUÇÃO.
 * Frases curtas e grandes (fáceis no celular): gancho → dor → virada →
 * app resolvendo → resultado → CTA. Durações no TIMELINE_PROBLEMA.
 */
export function ProblemSolutionAd() {
  let t = 0
  const at = (dur) => {
    const from = t
    t += dur
    return { from, durationInFrames: dur }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: colors.surface }}>
      <Sequence {...at(sec(T.hook))} name="1 · Gancho">
        <StatementScene kicker="Confeiteira…" text={C.hook} variant="navy" size={116} />
      </Sequence>

      <Sequence {...at(sec(T.problema1))} name="2 · Problema">
        <StatementScene text={C.problema1} variant="danger" size={120} />
      </Sequence>

      <Sequence {...at(sec(T.problema2))} name="3 · Problema">
        <StatementScene text={C.problema2} variant="danger" size={104} />
      </Sequence>

      <Sequence {...at(sec(T.virada))} name="4 · Virada">
        <StatementScene text={C.virada} variant="navy" size={112} accentLine={1} />
      </Sequence>

      <Sequence {...at(sec(T.demo))} name="5 · App resolvendo">
        <CompactDemo />
      </Sequence>

      <Sequence {...at(sec(T.result))} name="6 · Resultado">
        <ResultScene title={C.resultTitle} sub={C.resultSub} />
      </Sequence>

      <Sequence {...at(sec(T.cta))} name="7 · CTA">
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  )
}
