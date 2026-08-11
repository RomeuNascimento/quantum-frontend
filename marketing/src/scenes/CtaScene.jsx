import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { Background } from '../components/Background.jsx'
import { LogoMark } from '../components/Logo.jsx'
import { colors } from '../theme/tokens.js'
import { family } from '../theme/fonts.js'
import { springs, s01, enterUp } from '../theme/anim.js'
import { BRAND, COPY } from '../config/video.config.js'

/**
 * CTA final (16,2–18,6s): marca + "Experimente agora" + domínio.
 * Fundo navy para fechar com o tom da marca.
 */
export function CtaScene() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const logoP = s01(frame, fps, 2, springs.pop)
  const logoScale = interpolate(logoP, [0, 1], [0.7, 1])

  const btn = enterUp(frame, fps, 24, 34)
  const pulse = 1 + Math.sin(frame / 8) * 0.015

  return (
    <AbsoluteFill>
      <Background variant="navy" drift={false} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        {/* Marca */}
        <div style={{ transform: `scale(${logoScale})`, opacity: logoP, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
          <LogoMark size={150} color={colors.onPrimary} notch={colors.primary} />
          <div
            style={{
              fontFamily: family.serif,
              fontWeight: 700,
              fontSize: 92,
              letterSpacing: '-0.03em',
              color: colors.onPrimary,
            }}
          >
            {BRAND.name}
          </div>
          <div style={{ fontFamily: family.mono, fontSize: 24, letterSpacing: '0.16em', textTransform: 'uppercase', color: colors.accentSoft }}>
            {BRAND.tagline}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 80, textAlign: 'center', ...btn }}>
          <div
            style={{
              display: 'inline-block',
              background: colors.accentSoft,
              color: colors.primary,
              borderRadius: 999,
              padding: '26px 64px',
              fontFamily: family.sans,
              fontWeight: 700,
              fontSize: 44,
              transform: `scale(${pulse})`,
              boxShadow: '0 24px 60px -18px rgba(249,186,119,0.5)',
            }}
          >
            {COPY.cta.line}
          </div>
          <div style={{ marginTop: 30, fontFamily: family.mono, fontSize: 30, color: colors.onPrimary, letterSpacing: '0.02em' }}>
            {BRAND.domain}
          </div>
          <div style={{ marginTop: 10, fontFamily: family.sans, fontSize: 24, color: 'rgba(255,255,255,0.6)' }}>
            {COPY.cta.sub}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
