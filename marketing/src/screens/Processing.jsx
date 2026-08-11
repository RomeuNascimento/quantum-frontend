import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { colors } from '../theme/tokens.js'
import { family } from '../theme/fonts.js'
import { StatusBarSpace, QAvatar } from './ui.jsx'
import { StepBar } from './StepBar.jsx'

/**
 * Fase PROCESSANDO — a IA "lendo" a receita (spinner girando).
 */
export function Processing() {
  const frame = useCurrentFrame()
  const rot = (frame * 12) % 360
  return (
    <AbsoluteFill style={{ background: colors.surface }}>
      <StatusBarSpace />
      <div style={{ padding: '4px 20px 0' }}>
        <StepBar current={1} />
      </div>
      <div style={{ padding: '22px 20px 0', display: 'flex', gap: 12, alignItems: 'center' }}>
        <QAvatar size={40} />
        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.outline}`,
            borderRadius: 16,
            borderTopLeftRadius: 4,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              border: `3px solid ${colors.outline}`,
              borderTopColor: colors.accent,
              transform: `rotate(${rot}deg)`,
            }}
          />
          <span style={{ fontFamily: family.sans, fontSize: 16, color: colors.onSurface }}>
            Tô lendo e organizando os ingredientes…
          </span>
        </div>
      </div>
    </AbsoluteFill>
  )
}
