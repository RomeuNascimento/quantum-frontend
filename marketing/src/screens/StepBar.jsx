import { colors } from '../theme/tokens.js'
import { family } from '../theme/fonts.js'

/**
 * Barra de progresso 1·2·3·4 do assistente (src/pages/Assistente/StepBar.jsx).
 */
export function StepBar({ current = 1, total = 4 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.onSurface} strokeWidth={1.75}>
        <path d="M15 19l-7-7 7-7" />
      </svg>
      <div style={{ display: 'flex', gap: 6, flex: 1 }}>
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1
          const active = n <= current
          return (
            <div key={n} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: active ? colors.primary : colors.surface2,
                  color: active ? colors.onPrimary : colors.onSurfaceDim,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: family.mono,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {n}
              </div>
              {n < total && <div style={{ flex: 1, height: 2, background: n < current ? colors.primary : colors.outline }} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
