import { AbsoluteFill } from 'remotion'
import { colors } from '../theme/tokens.js'
import { family } from '../theme/fonts.js'
import { DEVICE } from '../theme/device.js'
import { StatusBarSpace, QAvatar, Card, Num, brl, BottomNavMock } from './ui.jsx'

/**
 * Tela principal do app: o "assistente" (src/pages/Assistente/index.jsx).
 * Header navy com cantos inferiores arredondados, avatar "Q" dourado, título
 * serifado "Vamos descobrir quanto cobrar?" e o card-CTA "Calcular meu preço".
 *
 * Coordenadas de interesse (para cursor/highlight nas cenas):
 *   CTA "Calcular meu preço" → rect { x: 20, y: 250, w: 390, h: 96 }
 */
export const HOME_CTA_RECT = { x: 20, y: 250, w: 390, h: 96 }

export function AssistenteHome() {
  return (
    <AbsoluteFill style={{ background: colors.surface }}>
      {/* HERO navy */}
      <div
        style={{
          background: colors.primary,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          padding: '0 22px 26px',
        }}
      >
        <StatusBarSpace />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <span
            style={{
              fontFamily: family.mono,
              fontSize: 14,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: colors.onPrimary,
            }}
          >
            Quantum
          </span>
          <div style={{ width: 34, height: 34, borderRadius: '50%', border: `1.5px solid rgba(255,255,255,0.4)` }} />
        </div>

        <div style={{ display: 'flex', gap: 14, marginTop: 26, alignItems: 'flex-start' }}>
          <QAvatar size={46} />
          <div>
            <div
              style={{
                fontFamily: family.mono,
                fontSize: 12,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: colors.accentSoft,
                marginBottom: 8,
              }}
            >
              Boa tarde, Marina
            </div>
            <div
              style={{
                fontFamily: family.serif,
                fontWeight: 700,
                fontSize: 30,
                lineHeight: 1.1,
                color: colors.onPrimary,
                letterSpacing: '-0.01em',
              }}
            >
              Vamos descobrir
              <br />
              quanto cobrar?
            </div>
          </div>
        </div>
      </div>

      {/* CTA card (sobrepõe o fim do hero) */}
      <div style={{ padding: '16px 20px 0' }}>
        <Card
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 18,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: colors.accentSoft,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: family.serif, fontSize: 40, color: colors.primary, lineHeight: 1, marginTop: -4 }}>
              +
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: family.sans, fontWeight: 600, fontSize: 20, color: colors.onSurface }}>
              Calcular meu preço
            </div>
            <div style={{ fontFamily: family.sans, fontSize: 14, color: colors.onSurfaceDim, marginTop: 2 }}>
              Mande a receita · eu faço as contas
            </div>
          </div>
          <Chevron />
        </Card>
      </div>

      {/* Atalhos */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontFamily: family.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: colors.secondary, marginBottom: 12 }}>
          Atalhos
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            ['Importar nota', 'Foto da nota fiscal'],
            ['Relatório', 'Margem por produto'],
            ['Orçamento', 'Enviar por WhatsApp'],
            ['Lista de compras', 'Do que comprar'],
          ].map(([t, s]) => (
            <div key={t} style={{ background: colors.card, border: `1px solid ${colors.outline}`, borderRadius: 14, padding: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: colors.surface2, marginBottom: 10 }} />
              <div style={{ fontFamily: family.sans, fontWeight: 600, fontSize: 15, color: colors.onSurface }}>{t}</div>
              <div style={{ fontFamily: family.sans, fontSize: 12, color: colors.onSurfaceDim, marginTop: 1 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Seus produtos */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontFamily: family.mono, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: colors.secondary }}>
            Seus produtos
          </span>
          <span style={{ fontFamily: family.mono, fontSize: 12, color: colors.accent }}>Ver todos →</span>
        </div>
        <div style={{ background: colors.card, border: `1px solid ${colors.outline}`, borderRadius: 14, overflow: 'hidden' }}>
          {[
            ['Brigadeiro gourmet', 'R$ 2,50'],
            ['Torta de limão', 'R$ 6,90'],
          ].map(([n, p], i) => (
            <div
              key={n}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 16px',
                borderTop: i ? `1px solid ${colors.outline}` : 'none',
              }}
            >
              <span style={{ fontFamily: family.serif, fontWeight: 600, fontSize: 17, color: colors.primary }}>{n}</span>
              <Num style={{ fontSize: 15, color: colors.onSurfaceDim }}>{p}</Num>
            </div>
          ))}
        </div>
      </div>

      <BottomNavMock active="Início" />
    </AbsoluteFill>
  )
}

function Chevron() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.onSurfaceDim} strokeWidth={1.75}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}
