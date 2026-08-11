import { AbsoluteFill } from 'remotion'
import { colors } from '../theme/tokens.js'
import { family } from '../theme/fonts.js'
import { StatusBarSpace, QAvatar, Num, brl } from './ui.jsx'
import { StepBar } from './StepBar.jsx'
import { PRODUCT, precoDe, lucroDe } from '../config/video.config.js'

/**
 * Etapa 4 (src/pages/Assistente/Etapa4Preco.jsx) — a "money shot":
 * card navy "Preço recomendado" com número grande dourado + slider de margem.
 * O preço reage à margem em tempo real (a cena move o slider).
 *
 * props: margem, preco, lucro  (a cena calcula e passa a cada frame)
 */

// Geometria do slider (para o cursor "pegar" o thumb). Track dentro do card.
const CARD_X = 20
const CARD_INNER = 20
export const SLIDER = {
  y: 398, // centro vertical do thumb (medido no layout renderizado)
  x0: CARD_X + CARD_INNER, // início do track
  x1: 430 - CARD_X - CARD_INNER, // fim do track
  max: 90,
  thumbX(margem) {
    return this.x0 + (margem / this.max) * (this.x1 - this.x0)
  },
}

export function PriceScreen({
  margem = PRODUCT.margemAlvo,
  preco = precoDe(PRODUCT.margemAlvo),
  lucro = lucroDe(PRODUCT.margemAlvo),
}) {
  const thumbX = SLIDER.thumbX(margem)
  const fillPct = (margem / SLIDER.max) * 100

  return (
    <AbsoluteFill style={{ background: colors.surface }}>
      <StatusBarSpace />
      <div style={{ padding: '4px 20px 0' }}>
        <StepBar current={4} />
      </div>

      {/* Bolha */}
      <div style={{ padding: '18px 20px 0', display: 'flex', gap: 12 }}>
        <QAvatar size={40} />
        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.outline}`,
            borderRadius: 16,
            borderTopLeftRadius: 4,
            padding: '13px 16px',
            fontFamily: family.sans,
            fontSize: 15,
            lineHeight: 1.4,
            color: colors.onSurface,
          }}
        >
          Última etapa! O <b>{PRODUCT.name}</b> custou <Num style={{ color: colors.accent, fontWeight: 700 }}>{brl(PRODUCT.custoTotal)}</Num> pra fazer. 💰
        </div>
      </div>

      {/* Card navy — preço recomendado + slider */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ background: colors.primary, borderRadius: 20, padding: CARD_INNER, boxShadow: '0 20px 44px -20px rgba(5,17,37,0.6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: family.mono, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
              Preço recomendado
            </span>
            <span style={{ fontFamily: family.mono, fontSize: 12, color: colors.accentSoft }}>venda direta</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 12 }}>
            <Num style={{ fontFamily: family.mono, fontWeight: 700, fontSize: 62, color: colors.accentSoft, lineHeight: 1 }}>
              {brl(preco)}
            </Num>
            <span style={{ fontFamily: family.sans, fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>por unidade</span>
          </div>

          <div style={{ fontFamily: family.sans, fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 8 }}>
            Lucro de <Num style={{ color: colors.accentSoft, fontWeight: 600 }}>{brl(lucro)}</Num> por fatia
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.16)', margin: '18px 0 16px' }} />

          {/* Slider */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: family.sans, fontSize: 16, color: 'rgba(255,255,255,0.85)' }}>Margem</span>
            <Num style={{ fontFamily: family.mono, fontWeight: 700, fontSize: 22, color: colors.accentSoft }}>{Math.round(margem)}%</Num>
          </div>
          <div style={{ position: 'relative', height: 8, marginTop: 14, marginBottom: 6 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'rgba(255,255,255,0.18)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${fillPct}%`, borderRadius: 999, background: colors.accentSoft }} />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${fillPct}%`,
                width: 26,
                height: 26,
                marginLeft: -13,
                marginTop: -13,
                borderRadius: '50%',
                background: colors.accentSoft,
                border: `3px solid ${colors.primary}`,
                boxShadow: '0 3px 10px rgba(0,0,0,0.4)',
              }}
            />
          </div>
          <div style={{ fontFamily: family.sans, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
            Arraste e veja o preço mudar.
          </div>
        </div>
      </div>

      {/* Botão finalizar */}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 44 }}>
        <div
          style={{
            background: colors.primary,
            color: colors.onPrimary,
            borderRadius: 999,
            padding: '18px 0',
            textAlign: 'center',
            fontFamily: family.sans,
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          Finalizar e salvar →
        </div>
      </div>
    </AbsoluteFill>
  )
}
