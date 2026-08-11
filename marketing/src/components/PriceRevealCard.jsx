import { colors } from '../theme/tokens.js'
import { family } from '../theme/fonts.js'
import { brl, MargemBadge } from '../screens/ui.jsx'

/**
 * Card navy de "preço revelado" — o herói visual (usado no gancho e no
 * resultado). Número grande dourado + badge de margem. Autônomo (fora do
 * celular), para momentos full-bleed de impacto.
 *
 * props: preco, margem, lucro, product(name), width
 */
export function PriceRevealCard({ preco, margem, lucro, name = '', width = 720 }) {
  return (
    <div
      style={{
        width,
        background: colors.primary,
        borderRadius: 34,
        padding: 48,
        boxShadow: '0 50px 100px -30px rgba(5,17,37,0.6)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: family.mono,
            fontSize: 22,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          Preço de venda
        </span>
        <MargemBadge margem={margem} />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: 20 }}>
        <span
          style={{
            fontFamily: family.mono,
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
            fontSize: 148,
            lineHeight: 0.92,
            color: colors.accentSoft,
          }}
        >
          {brl(preco)}
        </span>
        <span style={{ fontFamily: family.sans, fontSize: 30, color: 'rgba(255,255,255,0.7)', marginBottom: 22 }}>/ fatia</span>
      </div>

      {name ? (
        <div style={{ fontFamily: family.serif, fontStyle: 'italic', fontSize: 30, color: colors.onPrimary, marginTop: 18 }}>
          {name}
        </div>
      ) : null}

      <div style={{ height: 1, background: 'rgba(255,255,255,0.16)', margin: '26px 0' }} />

      <div style={{ display: 'flex', gap: 40 }}>
        <div>
          <div style={{ fontFamily: family.mono, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.55)' }}>
            Lucro / fatia
          </div>
          <div style={{ fontFamily: family.mono, fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 44, color: colors.onPrimary, marginTop: 6 }}>
            {brl(lucro)}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: family.mono, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.55)' }}>
            Margem
          </div>
          <div style={{ fontFamily: family.mono, fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 44, color: colors.accentSoft, marginTop: 6 }}>
            {Math.round(margem)}%
          </div>
        </div>
      </div>
    </div>
  )
}
