import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { Background } from '../components/Background.jsx'
import { PhoneFrame } from '../components/PhoneFrame.jsx'
import { FloatingStat } from '../components/FloatingStat.jsx'
import { LogoMark } from '../components/Logo.jsx'
import { AssistenteHome } from '../screens/AssistenteHome.jsx'
import { PriceScreen } from '../screens/PriceScreen.jsx'
import { RelatorioScreen } from '../screens/RelatorioScreen.jsx'
import { colors } from '../theme/tokens.js'
import { family } from '../theme/fonts.js'
import { springs, s01, enterUp } from '../theme/anim.js'
import { TIMELINE_SHOWCASE as T, COPY_SHOWCASE as C, PRODUCT, precoDe, lucroDe, sec, SPEED } from '../config/video.config.js'

/**
 * VÍDEO 3 — PRODUCT SHOWCASE.
 * A interface é a protagonista: um celular flutua com perspectiva sobre fundo
 * navy, as telas trocam com transições elegantes e "pílulas de dado" saem da UI
 * (profundidade). Fecho com a marca. Durações no TIMELINE_SHOWCASE.
 */
const B = {
  intro: sec(T.intro),
  feat1: sec(T.feat1),
  feat2: sec(T.feat2),
  feat3: sec(T.feat3),
  outro: sec(T.outro),
}
const s1 = B.intro
const s2 = s1 + B.feat1
const s3 = s2 + B.feat2
const s4 = s3 + B.feat3 // início do outro

export function ProductShowcaseAd() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // ── Entrada do celular (intro) e recuo (outro) ──
  const inP = s01(frame, fps, 4, springs.gentle)
  const outP = interpolate(frame, [s4, s4 + 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Flutuação contínua (oscilação suave = profundidade viva)
  const floatY = Math.sin(frame / 26) * 14
  const tiltOsc = Math.sin(frame / 34) * 3
  const baseTilt = -10
  const tilt = interpolate(inP, [0, 1], [24, baseTilt]) + tiltOsc * inP
  const phoneEnterY = interpolate(inP, [0, 1], [260, 0])
  const phoneEnterX = interpolate(inP, [0, 1], [120, 0])
  const phoneScale = interpolate(inP, [0, 1], [0.8, 1]) * interpolate(outP, [0, 1], [1, 0.86])
  const phoneOpacity = interpolate(outP, [0, 1], [1, 0])

  // Câmera: leve push-in ao longo do showcase
  const camScale = interpolate(frame, [s1, s4], [1, 1.06], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // ── Tela ativa por beat ──
  // 'home' aparece desde o frame 0 (intro) — por isso beatStart=0 aqui, senão
  // a tela do celular fica branca durante a entrada.
  let screen = 'home'
  let beatStart = 0
  if (frame >= s3) {
    screen = 'relatorio'
    beatStart = s3
  } else if (frame >= s2) {
    screen = 'price'
    beatStart = s2
  }

  const margem = interpolate(frame, [s2 + 12, s3 - 10], [PRODUCT.margemInicial, PRODUCT.margemAlvo], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const relCount = Math.round(interpolate(frame * SPEED, [s3 + 4, s3 + 40], [0, 3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }))

  return (
    <AbsoluteFill>
      <Background variant="navy" drift />

      {/* ── INTRO: título ── */}
      <IntroTitle />

      {/* ── Celular flutuante ── */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            transform: `translate(${phoneEnterX}px, ${phoneEnterY + floatY - 40}px) scale(${phoneScale * camScale})`,
            opacity: phoneOpacity,
            filter: `drop-shadow(0 60px 90px rgba(0,0,0,0.5))`,
          }}
        >
          <PhoneFrame scale={1.28} tilt={tilt}>
            <ScreenFade beatStart={beatStart} keyName={screen}>
              {screen === 'home' && <AssistenteHome />}
              {screen === 'price' && <PriceScreen margem={margem} preco={precoDe(margem)} lucro={lucroDe(margem)} />}
              {screen === 'relatorio' && <RelatorioScreen visibleCount={relCount} />}
            </ScreenFade>
          </PhoneFrame>
        </div>
      </AbsoluteFill>

      {/* ── Pílulas de dado saindo da UI (por beat) ── */}
      {frame >= s1 && frame < s2 && (
        <StatSlot x="66%" y="24%">
          <FloatingStat value={C.features[0].stat} label="Foto → dados" variant="light" delay={s1 + 6} />
        </StatSlot>
      )}
      {frame >= s2 && frame < s3 && (
        <>
          <StatSlot x="70%" y="22%">
            <FloatingStat value={C.features[1].stat} label="Margem" variant="gold" delay={s2 + 8} />
          </StatSlot>
          <StatSlot x="24%" y="70%">
            <FloatingStat value={`R$ ${precoDe(PRODUCT.margemAlvo).toFixed(2).replace('.', ',')}`} label="Preço / fatia" variant="light" delay={s2 + 16} />
          </StatSlot>
        </>
      )}
      {frame >= s3 && frame < s4 && (
        <StatSlot x="70%" y="24%">
          <FloatingStat value={C.features[2].stat} label="Por canal" variant="gold" delay={s3 + 8} />
        </StatSlot>
      )}

      {/* ── Legenda do beat (rodapé) ── */}
      <BeatCaption screen={screen} beatStart={beatStart} visible={frame >= s1 && frame < s4} />

      {/* ── OUTRO: marca + CTA ── */}
      {frame >= s4 && <Outro startAt={s4} />}
    </AbsoluteFill>
  )
}

/** Título da intro que sai de cena quando o showcase começa. */
function IntroTitle() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  if (frame >= s1 + 6) return null
  const st = enterUp(frame, fps, 2, 40)
  const out = interpolate(frame, [s1 - 12, s1 + 4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  // No topo (sobre o navy), acima do celular — texto claro não some sobre a tela branca.
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: 96 }}>
      <div style={{ textAlign: 'center', padding: '0 80px', opacity: out, ...st }}>
        <div style={{ fontFamily: family.mono, fontSize: 20, letterSpacing: '0.18em', textTransform: 'uppercase', color: colors.accentSoft, marginBottom: 18 }}>
          {C.introKicker}
        </div>
        <div style={{ fontFamily: family.serif, fontWeight: 700, fontSize: 72, lineHeight: 1.05, letterSpacing: '-0.02em', color: colors.onPrimary }}>
          {C.introTitle.split('\n').map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  )
}

function StatSlot({ x, y, children }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)' }}>{children}</div>
  )
}

function ScreenFade({ beatStart, keyName, children }) {
  const frame = useCurrentFrame()
  const p = interpolate(frame, [beatStart, beatStart + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill key={keyName} style={{ opacity: p, transform: `scale(${interpolate(p, [0, 1], [1.04, 1])})`, background: colors.surface }}>
      {children}
    </AbsoluteFill>
  )
}

function BeatCaption({ screen, beatStart, visible }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  if (!visible) return null
  const idx = screen === 'home' ? 0 : screen === 'price' ? 1 : 2
  // 'home' começa em 0, mas a legenda só deve animar quando o beat feat1 começa (s1).
  const capStart = Math.max(beatStart, s1)
  const st = enterUp(frame - capStart, fps, 2, 26)
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 150 }}>
      <div
        style={{
          fontFamily: family.serif,
          fontWeight: 700,
          fontSize: 52,
          color: colors.onPrimary,
          textAlign: 'center',
          padding: '0 70px',
          ...st,
        }}
      >
        {C.features[idx].caption}
      </div>
    </AbsoluteFill>
  )
}

function Outro({ startAt }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = s01(frame, fps, startAt + 6, springs.pop)
  const btn = enterUp(frame, fps, startAt + 22, 34)
  const pulse = 1 + Math.sin(frame / 8) * 0.015
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ transform: `scale(${interpolate(p, [0, 1], [0.8, 1])})`, opacity: p, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <LogoMark size={130} color={colors.onPrimary} notch={colors.primary} />
        </div>
        <div style={{ fontFamily: family.serif, fontWeight: 700, fontSize: 96, lineHeight: 1.03, color: colors.onPrimary }}>
          {C.outroTitle.split('\n').map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 64, textAlign: 'center', ...btn }}>
        <div
          style={{
            display: 'inline-block',
            background: colors.accentSoft,
            color: colors.primary,
            borderRadius: 999,
            padding: '24px 60px',
            fontFamily: family.sans,
            fontWeight: 700,
            fontSize: 42,
            transform: `scale(${pulse})`,
            boxShadow: '0 24px 60px -18px rgba(249,186,119,0.5)',
          }}
        >
          Experimente agora
        </div>
        <div style={{ marginTop: 26, fontFamily: family.mono, fontSize: 28, color: 'rgba(255,255,255,0.85)' }}>quantumcalc.com.br</div>
      </div>
    </AbsoluteFill>
  )
}
