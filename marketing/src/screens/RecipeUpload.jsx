import { AbsoluteFill } from 'remotion'
import { colors } from '../theme/tokens.js'
import { family } from '../theme/fonts.js'
import { StatusBarSpace, QAvatar } from './ui.jsx'
import { StepBar } from './StepBar.jsx'

/**
 * Etapa 1 do assistente (src/pages/Assistente/Fluxo.jsx — fase INTRO):
 * bolha do "Q", caixa de upload tracejada e textarea onde a receita é digitada.
 *
 * props:
 *  typedText : trecho já "digitado" na textarea (a cena controla o typing)
 *  caret     : mostra o cursor piscando no fim do texto
 * Alvo p/ cursor: botão "Ler minha receita" → rect { x: 20, y: 812, w: 390, h: 64 }
 */
export const READ_BTN_RECT = { x: 20, y: 812, w: 390, h: 62 }

export function RecipeUpload({ typedText = '', caret = false }) {
  return (
    <AbsoluteFill style={{ background: colors.surface }}>
      <StatusBarSpace />
      <div style={{ padding: '4px 20px 0' }}>
        <StepBar current={1} />
      </div>

      {/* Bolha do assistente */}
      <div style={{ padding: '22px 20px 0', display: 'flex', gap: 12 }}>
        <QAvatar size={40} />
        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.outline}`,
            borderRadius: 16,
            borderTopLeftRadius: 4,
            padding: '14px 16px',
            fontFamily: family.sans,
            fontSize: 16,
            lineHeight: 1.4,
            color: colors.onSurface,
          }}
        >
          Primeiro me mostra a <b>receita</b> do que você quer vender. Manda foto, print, PDF — ou escreve aqui. 📸
        </div>
      </div>

      {/* Caixa de upload */}
      <div style={{ padding: '22px 20px 0' }}>
        <div
          style={{
            border: `2px dashed ${colors.outlineStrong}`,
            borderRadius: 16,
            padding: '26px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            background: colors.surface1,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth={1.6}>
            <path d="M3 7h4l2-2h6l2 2h4v12H3z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          <div style={{ fontFamily: family.sans, fontWeight: 600, fontSize: 17, color: colors.onSurface }}>
            Tirar foto ou anexar
          </div>
          <div style={{ fontFamily: family.mono, fontSize: 12, color: colors.onSurfaceDim, letterSpacing: '0.04em' }}>
            FOTO · PDF · EXCEL · CSV
          </div>
        </div>
      </div>

      {/* divisor "ou escreva" */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 0' }}>
        <div style={{ flex: 1, height: 1, background: colors.outline }} />
        <span style={{ fontFamily: family.mono, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: colors.onSurfaceDim }}>
          ou escreva
        </span>
        <div style={{ flex: 1, height: 1, background: colors.outline }} />
      </div>

      {/* Textarea com typing */}
      <div style={{ padding: '16px 20px 0' }}>
        <div
          style={{
            background: colors.surface1,
            border: `1px solid ${colors.outline}`,
            borderRadius: 14,
            padding: 16,
            minHeight: 132,
            fontFamily: family.sans,
            fontSize: 16,
            lineHeight: 1.45,
            color: typedText ? colors.onSurface : colors.onSurfaceDim,
          }}
        >
          {typedText || 'Ex: Bolo de cenoura, 3 ovos, 2 xíc de açúcar, 1 xíc de óleo…'}
          {caret && <span style={{ color: colors.accent, fontWeight: 700 }}>|</span>}
        </div>
      </div>

      {/* Botão inferior fixo */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 44,
        }}
      >
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
          Ler minha receita
        </div>
      </div>
    </AbsoluteFill>
  )
}
