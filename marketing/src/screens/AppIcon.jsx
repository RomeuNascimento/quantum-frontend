import { APP_ICON } from '../config/video.config.js'
import { family } from '../theme/fonts.js'
import { colors } from '../theme/tokens.js'

/**
 * Ícone do app EXATAMENTE como o PWA instala (public/icons/icon-192.png):
 * tile preto com cantos arredondados (~24%) + Q verde-limão (quadrado c/ entalhe).
 * `label` mostra "Quantum" embaixo, como na tela inicial do Android.
 */
export function AppIcon({ size = 120, label = false, labelColor = '#FFFFFF' }) {
  const r = size * 0.24
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.12 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: r,
          background: APP_ICON.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 26px -8px rgba(0,0,0,0.5)',
        }}
      >
        <svg width={size * 0.66} height={size * 0.66} viewBox="0 0 100 100">
          <rect x="14" y="14" width="72" height="72" fill="none" stroke={APP_ICON.fg} strokeWidth="9" />
          <rect x="58" y="58" width="28" height="28" fill={APP_ICON.fg} />
          <rect x="72" y="72" width="14" height="14" fill={APP_ICON.bg} />
        </svg>
      </div>
      {label && (
        <span style={{ fontFamily: family.sans, fontWeight: 500, fontSize: size * 0.18, color: labelColor, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
          {APP_ICON.label}
        </span>
      )}
    </div>
  )
}
