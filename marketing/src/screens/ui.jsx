import { family } from '../theme/fonts.js'
import { colors } from '../theme/tokens.js'

/**
 * Átomos de UI que espelham o design system do app (.card, .eyebrow,
 * .title-serif, .badge, botões pílula navy, avatar "Q" do assistente).
 * Usados pelas telas reproduzidas em src/screens/*.
 */

export const StatusBarSpace = () => <div style={{ height: 54 }} />

export function Eyebrow({ children, color = colors.secondary, style }) {
  return (
    <div
      style={{
        fontFamily: family.mono,
        fontSize: 12,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function TitleSerif({ children, color = colors.primary, size = 30, style }) {
  return (
    <div
      style={{
        fontFamily: family.serif,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: '-0.01em',
        color,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Card({ children, style, dark = false }) {
  return (
    <div
      style={{
        background: dark ? colors.primary : colors.card,
        border: `1px solid ${dark ? 'transparent' : colors.outline}`,
        borderRadius: 16,
        padding: 18,
        boxShadow: dark ? '0 18px 40px -18px rgba(5,17,37,0.5)' : '0 8px 22px -14px rgba(5,17,37,0.16)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// Q avatar do assistente (círculo dourado com "Q" serifado)
export function QAvatar({ size = 44 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: colors.accentSoft,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span style={{ fontFamily: family.serif, fontWeight: 700, fontSize: size * 0.52, color: colors.primary }}>Q</span>
    </div>
  )
}

// Botão pílula navy (btn-primary)
export function PillButton({ children, style, icon }) {
  return (
    <div
      style={{
        background: colors.primary,
        color: colors.onPrimary,
        borderRadius: 999,
        padding: '15px 22px',
        fontFamily: family.sans,
        fontWeight: 600,
        fontSize: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...style,
      }}
    >
      {children}
      {icon}
    </div>
  )
}

// Badge de margem (Saudável / Atenção / Revisar) — cores exatas do app
export function MargemBadge({ margem }) {
  let bg = colors.positiveBg
  let fg = colors.positive
  let label = `+ Saudável ${Math.round(margem)}%`
  if (margem < 10) {
    bg = colors.dangerBg
    fg = colors.onDangerBg
    label = `− Revisar ${Math.round(margem)}%`
  } else if (margem < 30) {
    bg = colors.warm
    fg = colors.onWarm
    label = `± Atenção ${Math.round(margem)}%`
  }
  return (
    <span
      style={{
        fontFamily: family.mono,
        fontSize: 12,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: bg,
        color: fg,
        borderRadius: 999,
        padding: '5px 11px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

// Número mono (preços, %) — sempre tabular
export function Num({ children, style }) {
  return (
    <span style={{ fontFamily: family.mono, fontVariantNumeric: 'tabular-nums', ...style }}>{children}</span>
  )
}

export const brl = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0)

// Mini bottom nav (só visual, para dar contexto de app)
export function BottomNavMock({ active = 'Início' }) {
  const tabs = ['Início', 'Receitas', 'Produtos', 'Preços']
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        borderTop: `1px solid ${colors.outline}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 12,
      }}
    >
      {tabs.map((t) => (
        <div key={t} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              border: `2px solid ${t === active ? colors.primary : colors.onSurfaceDim}`,
              opacity: t === active ? 1 : 0.5,
            }}
          />
          <span
            style={{
              fontFamily: family.mono,
              fontSize: 10,
              textTransform: 'uppercase',
              color: t === active ? colors.primary : colors.onSurfaceDim,
              opacity: t === active ? 1 : 0.6,
            }}
          >
            {t}
          </span>
        </div>
      ))}
    </div>
  )
}
