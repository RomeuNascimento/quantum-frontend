import { useCurrentFrame, interpolate } from 'remotion'
import { family } from '../theme/fonts.js'
import { colors } from '../theme/tokens.js'

/**
 * Menu ⋮ do Chrome (Android) abrindo no canto superior direito, com o item
 * "Instalar aplicativo" em destaque. Aparece com escala a partir do canto.
 *
 * props: start (frame em que abre), highlightAt (frame em que realça o item).
 * Coordenada do item "Instalar" (para o cursor): centro ≈ { x: 250, y: 320 }.
 */
export const INSTALL_ITEM = { x: 250, y: 320 }

const ITEMS = [
  { icon: 'star', label: 'Favoritos' },
  { icon: 'clock', label: 'Histórico' },
  { icon: 'download', label: 'Downloads' },
  { icon: 'share', label: 'Compartilhar…' },
  { icon: 'install', label: 'Instalar aplicativo', highlight: true },
  { icon: 'desktop', label: 'Site para computador' },
]

export function ChromeMenu({ start = 0, highlightAt = 0 }) {
  const frame = useCurrentFrame()
  const p = interpolate(frame, [start, start + 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const hl = interpolate(frame, [highlightAt, highlightAt + 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        position: 'absolute',
        top: 96,
        right: 14,
        width: 300,
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 18px 44px rgba(0,0,0,0.28)',
        padding: '8px 0',
        transform: `scale(${interpolate(p, [0, 1], [0.7, 1])})`,
        transformOrigin: 'top right',
        opacity: p,
        zIndex: 45,
      }}
    >
      {ITEMS.map((it) => (
        <div
          key={it.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '13px 18px',
            background: it.highlight ? `rgba(165,101,43,${0.14 * hl})` : 'transparent',
          }}
        >
          <MenuIcon name={it.icon} color={it.highlight ? colors.accent : '#5F6368'} />
          <span
            style={{
              fontFamily: family.sans,
              fontSize: 17,
              color: it.highlight ? colors.accent : '#3C4043',
              fontWeight: it.highlight ? 700 : 400,
            }}
          >
            {it.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function MenuIcon({ name, color }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'install')
    return (
      <svg {...p}>
        <path d="M12 3v12" />
        <path d="M7 10l5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
    )
  if (name === 'star') return <svg {...p}><path d="M12 3l2.6 5.6L21 9.3l-4.5 4.3L17.8 21 12 17.6 6.2 21l1.3-7.4L3 9.3l6.4-.7z" /></svg>
  if (name === 'clock') return <svg {...p}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>
  if (name === 'download') return <svg {...p}><path d="M12 4v10m0 0l-4-4m4 4l4-4M5 20h14" /></svg>
  if (name === 'share') return <svg {...p}><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8 11l8-4.5M8 13l8 4.5" /></svg>
  return <svg {...p}><rect x="3" y="5" width="18" height="12" rx="1.5" /><path d="M8 21h8" /></svg>
}
