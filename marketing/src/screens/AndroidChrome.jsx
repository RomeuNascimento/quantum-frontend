import { AbsoluteFill } from 'remotion'
import { colors } from '../theme/tokens.js'
import { family } from '../theme/fonts.js'
import { AssistenteHome } from './AssistenteHome.jsx'
import { COPY_INSTALL } from '../config/video.config.js'

/**
 * Navegador Chrome no Android: barra de status + omnibox (cadeado + URL +
 * contador de abas + menu ⋮) e, abaixo, o site (a home do app) recortado.
 *
 * Coordenada do ⋮ (para o cursor): centro ≈ { x: 402, y: 92 }.
 */
export const CHROME_MENU_DOT = { x: 402, y: 92 }
const TOOLBAR_H = 116

export function AndroidChrome() {
  return (
    <AbsoluteFill style={{ background: colors.surface }}>
      {/* Barra de status Android */}
      <div
        style={{
          height: 44,
          background: '#111317',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 22px',
          color: '#fff',
          fontFamily: family.sans,
          fontSize: 14,
          paddingTop: 8,
        }}
      >
        <span style={{ fontWeight: 600 }}>9:41</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', opacity: 0.9 }}>
          <span style={{ fontSize: 12 }}>5G</span>
          <div style={{ width: 22, height: 11, border: '1.5px solid #fff', borderRadius: 3, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 1.5, background: '#fff', width: '70%', borderRadius: 1 }} />
          </div>
        </div>
      </div>

      {/* Omnibox do Chrome */}
      <div
        style={{
          height: TOOLBAR_H - 44,
          background: '#F1F3F4',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 14px',
        }}
      >
        <div
          style={{
            flex: 1,
            background: '#fff',
            borderRadius: 999,
            height: 46,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 16px',
            border: '1px solid #E0E2E5',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5F6368" strokeWidth={2}>
            <rect x="5" y="11" width="14" height="9" rx="1.5" />
            <path d="M8 11V8a4 4 0 018 0v3" />
          </svg>
          <span style={{ fontFamily: family.sans, fontSize: 16, color: '#3C4043' }}>{COPY_INSTALL.url}</span>
        </div>
        {/* contador de abas */}
        <div style={{ width: 24, height: 24, border: '2px solid #5F6368', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: family.mono, fontSize: 12, color: '#5F6368', fontWeight: 700 }}>
          3
        </div>
        {/* menu ⋮ */}
        <div style={{ width: 34, height: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#3C4043' }} />
          ))}
        </div>
      </div>

      {/* Conteúdo do site (a home do app), recortado abaixo da toolbar */}
      <div style={{ position: 'absolute', top: TOOLBAR_H, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        {/* Sobe um pouco pra esconder a status-bar interna da tela e encaixar */}
        <div style={{ transform: 'translateY(-48px)' }}>
          <AssistenteHome />
        </div>
      </div>
    </AbsoluteFill>
  )
}
