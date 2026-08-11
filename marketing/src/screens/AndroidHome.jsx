import { AbsoluteFill, interpolate } from 'remotion'
import { family } from '../theme/fonts.js'
import { AppIcon } from './AppIcon.jsx'

/**
 * Tela inicial do Android — papel de parede, relógio e uma grade de ícones.
 * O ícone do Quantum "aparece" no último slot (props.appear 0→1) com pop.
 *
 * Slot do ícone Quantum (para o realce): centro ≈ { x: 340, y: 690 }.
 */
export const QUANTUM_SLOT = { x: 344, y: 640 }

const DOCK = ['#4285F4', '#EA4335', '#34A853', '#FBBC05']
const GRID = ['#7E57C2', '#26A69A', '#EC407A', '#42A5F5', '#FF7043', '#66BB6A', '#5C6BC0', null]

export function AndroidHome({ appear = 1 }) {
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(165deg, #2B3A67 0%, #1A2340 45%, #0E1428 100%)',
      }}
    >
      {/* status bar */}
      <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 22px 0', color: '#fff', fontFamily: family.sans, fontSize: 14 }}>
        <span style={{ fontWeight: 600 }}>9:41</span>
        <span style={{ opacity: 0.85, fontSize: 12 }}>5G ▮</span>
      </div>

      {/* relógio */}
      <div style={{ textAlign: 'center', marginTop: 40, color: '#fff' }}>
        <div style={{ fontFamily: family.sans, fontWeight: 300, fontSize: 84, lineHeight: 1 }}>9:41</div>
        <div style={{ fontFamily: family.sans, fontSize: 18, opacity: 0.85, marginTop: 4 }}>segunda-feira, 11 de agosto</div>
      </div>

      {/* grade de apps */}
      <div style={{ position: 'absolute', top: 476, left: 0, right: 0, padding: '0 34px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', rowGap: 30, columnGap: 16, justifyItems: 'center' }}>
          {GRID.map((c, i) => {
            const isQuantum = c === null
            if (isQuantum) {
              const pop = interpolate(appear, [0, 0.6, 1], [0, 1.12, 1])
              return (
                <div key={i} style={{ transform: `scale(${pop})`, opacity: interpolate(appear, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' }) }}>
                  <AppIcon size={72} label />
                </div>
              )
            }
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 72, height: 72, borderRadius: 18, background: c, boxShadow: '0 8px 20px -8px rgba(0,0,0,0.4)' }} />
                <div style={{ width: 46, height: 10, borderRadius: 6, background: 'rgba(255,255,255,0.35)' }} />
              </div>
            )
          })}
        </div>
      </div>

      {/* dock */}
      <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 26 }}>
        {DOCK.map((c, i) => (
          <div key={i} style={{ width: 76, height: 76, borderRadius: 20, background: c, boxShadow: '0 8px 20px -8px rgba(0,0,0,0.4)' }} />
        ))}
      </div>
    </AbsoluteFill>
  )
}
