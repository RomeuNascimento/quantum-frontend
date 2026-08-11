import { AbsoluteFill } from 'remotion'
import { colors } from '../theme/tokens.js'
import { family } from '../theme/fonts.js'
import { StatusBarSpace, QAvatar, Num } from './ui.jsx'
import { StepBar } from './StepBar.jsx'
import { PRODUCT } from '../config/video.config.js'

/**
 * Etapa 1 (fase REVISÃO) — a IA devolve a receita organizada: nome, rendimento
 * e a lista de ingredientes. Os ingredientes entram em stagger.
 *
 * props:
 *  visibleCount : quantos ingredientes já apareceram (a cena controla)
 */
export function RecipeReview({ visibleCount = PRODUCT.ingredients.length }) {
  return (
    <AbsoluteFill style={{ background: colors.surface }}>
      <StatusBarSpace />
      <div style={{ padding: '4px 20px 0' }}>
        <StepBar current={1} />
      </div>

      <div style={{ padding: '20px 20px 0', display: 'flex', gap: 12 }}>
        <QAvatar size={40} />
        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.outline}`,
            borderRadius: 16,
            borderTopLeftRadius: 4,
            padding: '13px 16px',
            fontFamily: family.sans,
            fontSize: 16,
            lineHeight: 1.4,
            color: colors.onSurface,
          }}
        >
          Pronto! Entendi assim 👇 Confere e ajusta se precisar.
        </div>
      </div>

      {/* Card da receita */}
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ background: colors.card, border: `1px solid ${colors.outline}`, borderRadius: 16, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: family.serif, fontWeight: 700, fontSize: 24, color: colors.primary }}>
              {PRODUCT.name}
            </div>
            <div
              style={{
                fontFamily: family.mono,
                fontSize: 12,
                color: colors.secondary,
                background: colors.surface1,
                borderRadius: 999,
                padding: '5px 11px',
              }}
            >
              Rende {PRODUCT.porcoes}
            </div>
          </div>

          <div
            style={{
              fontFamily: family.mono,
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: colors.secondary,
              margin: '18px 0 10px',
            }}
          >
            Ingredientes ({PRODUCT.ingredients.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PRODUCT.ingredients.map((ing, i) => {
              const shown = i < visibleCount
              return (
                <div
                  key={ing.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    opacity: shown ? 1 : 0,
                    transform: shown ? 'translateX(0)' : 'translateX(-12px)',
                    transition: 'none',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.accent, flexShrink: 0 }} />
                  <div style={{ fontFamily: family.sans, fontSize: 17, color: colors.onSurface, flex: 1 }}>{ing.name}</div>
                  <Num style={{ fontSize: 15, color: colors.onSurfaceDim }}>{ing.qty}</Num>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Botão confirmar */}
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
          Confirmar receita →
        </div>
      </div>
    </AbsoluteFill>
  )
}
