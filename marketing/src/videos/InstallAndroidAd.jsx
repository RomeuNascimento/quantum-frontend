import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { Background } from '../components/Background.jsx'
import { PhoneFrame } from '../components/PhoneFrame.jsx'
import { AnimatedCursor } from '../components/AnimatedCursor.jsx'
import { AndroidChrome, CHROME_MENU_DOT } from '../screens/AndroidChrome.jsx'
import { ChromeMenu, INSTALL_ITEM } from '../screens/ChromeMenu.jsx'
import { AndroidHome } from '../screens/AndroidHome.jsx'
import { AppIcon } from '../screens/AppIcon.jsx'
import { colors } from '../theme/tokens.js'
import { family } from '../theme/fonts.js'
import { springs, s01, enterUp } from '../theme/anim.js'
import { TIMELINE_INSTALL as T, COPY_INSTALL as C, sec } from '../config/video.config.js'

/**
 * VÍDEO 4 — TUTORIAL (Android): como deixar o Quantum como app na tela inicial.
 * Um celular mostra o Chrome no site → toca no ⋮ → "Instalar aplicativo" →
 * confirma → o ícone aparece na tela inicial. Cursor guia cada toque.
 */
const B = {
  intro: sec(T.intro),
  browse: sec(T.browse),
  menu: sec(T.menu),
  confirm: sec(T.confirm),
  home: sec(T.home),
  outro: sec(T.outro),
}
const tBrowse = B.intro
const tMenu = tBrowse + B.browse
const tConfirm = tMenu + B.menu
const tHome = tConfirm + B.confirm
const tOutro = tHome + B.home
export const INSTALL_FRAMES = tOutro + B.outro

// marcos de toque (frames globais)
const tapMenu = tMenu + 8
const menuOpen = tapMenu + 4
const tapInstall = tConfirm - 8
const tapConfirm = tConfirm + 34

export function InstallAndroidAd() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // entrada do celular
  const inP = s01(frame, fps, 6, springs.gentle)
  const phoneY = interpolate(inP, [0, 1], [180, 0])
  const phoneScale = interpolate(inP, [0, 1], [0.9, 1])
  const tilt = interpolate(inP, [0, 1], [8, 0])

  // recuo no outro
  const outP = interpolate(frame, [tOutro, tOutro + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const phoneOpacity = interpolate(outP, [0, 1], [1, 0])
  const phoneOut = interpolate(outP, [0, 1], [1, 0.9])

  // tela ativa
  let screen = 'chrome'
  if (frame >= tHome) screen = 'home'

  const homeAppear = interpolate(frame, [tHome + 6, tHome + 34], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // legenda por etapa
  const caption = getCaption(frame)

  // cursor (some quando chega na tela inicial)
  const showCursor = frame >= B.intro + 20 && frame < tHome
  const cursorKeys = [
    { x: 215, y: 640, at: B.intro + 24 },
    { x: CHROME_MENU_DOT.x, y: CHROME_MENU_DOT.y, at: tapMenu },
    { x: INSTALL_ITEM.x, y: INSTALL_ITEM.y, at: tapInstall },
    { x: 356, y: 548, at: tapConfirm - 6 }, // botão "Instalar" do diálogo
  ]

  return (
    <AbsoluteFill>
      <Background variant="light" />

      {/* Título da intro / legenda das etapas */}
      {frame < B.intro ? <IntroTitle /> : <StepCaption text={caption} keyFrame={frame} />}

      {/* Celular */}
      {frame < tOutro && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ transform: `translateY(${phoneY}px) scale(${phoneScale * phoneOut})`, opacity: phoneOpacity }}>
            <PhoneFrame scale={1.46} tilt={tilt} glare={false}>
              {screen === 'chrome' ? <AndroidChrome /> : <AndroidHome appear={homeAppear} />}

              {/* menu ⋮ */}
              {frame >= menuOpen && frame < tConfirm && <ChromeMenu start={menuOpen} highlightAt={tapInstall - 14} />}

              {/* diálogo de instalação */}
              {frame >= tConfirm && frame < tHome && <InstallDialog start={tConfirm} />}

              {/* cursor */}
              {showCursor && <AnimatedCursor keyframes={cursorKeys} clicks={[tapMenu + 1, tapInstall + 1, tapConfirm + 1]} />}
            </PhoneFrame>
          </div>
        </AbsoluteFill>
      )}

      {/* Outro */}
      {frame >= tOutro && <Outro startAt={tOutro} />}
    </AbsoluteFill>
  )
}

function getCaption(frame) {
  if (frame < tMenu) return C.steps.abrir
  if (frame < menuOpen + 20) return C.steps.menu
  if (frame < tConfirm) return C.steps.instalar
  if (frame < tHome) return C.steps.confirmar
  return C.pronto
}

function IntroTitle() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const st = enterUp(frame, fps, 2, 40)
  const out = interpolate(frame, [B.intro - 12, B.intro], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: 100 }}>
      <div style={{ textAlign: 'center', padding: '0 70px', opacity: out, ...st }}>
        <div style={{ fontFamily: family.serif, fontWeight: 700, fontSize: 74, lineHeight: 1.05, letterSpacing: '-0.02em', color: colors.primary }}>
          {C.introTitle.split('\n').map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        <div style={{ marginTop: 20, fontFamily: family.mono, fontSize: 22, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.accent }}>
          {C.introSub}
        </div>
      </div>
    </AbsoluteFill>
  )
}

function StepCaption({ text, keyFrame }) {
  // Reinicia a animação a cada troca de texto (key implícita pelo texto).
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: 84 }}>
      <CaptionPill text={text} />
    </AbsoluteFill>
  )
}

function CaptionPill({ text }) {
  return (
    <div
      style={{
        display: 'inline-block',
        background: colors.primary,
        color: colors.onPrimary,
        borderRadius: 999,
        padding: '16px 34px',
        fontFamily: family.sans,
        fontWeight: 600,
        fontSize: 34,
        boxShadow: '0 14px 30px -14px rgba(5,17,37,0.5)',
        maxWidth: 900,
        textAlign: 'center',
      }}
    >
      {text}
    </div>
  )
}

function InstallDialog({ start }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = s01(frame, fps, start, springs.pop)
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.35)', zIndex: 46 }}>
      <div
        style={{
          width: 350,
          background: '#fff',
          borderRadius: 26,
          padding: 26,
          transform: `scale(${interpolate(p, [0, 1], [0.85, 1])})`,
          opacity: interpolate(p, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' }),
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <AppIcon size={58} />
          <div>
            <div style={{ fontFamily: family.sans, fontWeight: 700, fontSize: 20, color: '#202124' }}>Instalar aplicativo?</div>
            <div style={{ fontFamily: family.sans, fontSize: 14, color: '#5F6368', marginTop: 2 }}>Quantum · quantumcalc.com.br</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 26 }}>
          <div style={{ fontFamily: family.sans, fontWeight: 600, fontSize: 16, color: '#5F6368', padding: '10px 16px' }}>Cancelar</div>
          <div style={{ fontFamily: family.sans, fontWeight: 700, fontSize: 16, color: '#fff', background: colors.primary, borderRadius: 999, padding: '10px 24px' }}>Instalar</div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

function Outro({ startAt }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = s01(frame, fps, startAt + 4, springs.pop)
  return (
    <AbsoluteFill>
      <Background variant="navy" drift={false} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ transform: `scale(${interpolate(p, [0, 1], [0.8, 1])})`, opacity: p, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 34 }}>
            <AppIcon size={150} />
          </div>
          <div style={{ fontFamily: family.serif, fontWeight: 700, fontSize: 76, lineHeight: 1.06, color: colors.onPrimary }}>
            {C.outro.split('\n').map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
          <div style={{ marginTop: 26, fontFamily: family.mono, fontSize: 26, color: colors.accentSoft, letterSpacing: '0.04em' }}>
            {C.url}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
