import { colors, shadow } from '../theme/tokens.js'
import { DEVICE } from '../theme/device.js'

/**
 * Mockup de smartphone com bezel, ilha dinâmica, sombra profunda e leve
 * perspectiva 3D. A tela do app (children) é renderizada em DEVICE (430×932) e
 * recortada com cantos arredondados. Dá a profundidade de "interface flutuando"
 * dos anúncios de SaaS — o oposto de um screenshot chapado.
 *
 * props:
 *  scale   : escala do mockup inteiro (default 1)
 *  tilt    : graus de rotação Y (perspectiva). 0 = frontal.
 *  glare   : brilho diagonal no vidro (default true)
 */
export function PhoneFrame({ children, scale = 1, tilt = 0, glare = true }) {
  const bezel = 16
  const outerW = DEVICE.width + bezel * 2
  const outerH = DEVICE.height + bezel * 2
  const outerR = DEVICE.radius + bezel

  return (
    <div
      style={{
        width: outerW,
        height: outerH,
        transform: `perspective(2400px) rotateY(${tilt}deg) scale(${scale})`,
        transformStyle: 'preserve-3d',
        borderRadius: outerR,
        background: 'linear-gradient(150deg, #23262B 0%, #0C0E12 55%, #202329 100%)',
        padding: bezel,
        boxShadow: shadow.float,
        position: 'relative',
      }}
    >
      {/* Realce fino da borda do aparelho */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: outerR,
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.10), inset 0 0 0 6px rgba(0,0,0,0.35)',
          pointerEvents: 'none',
        }}
      />
      {/* Tela */}
      <div
        style={{
          width: DEVICE.width,
          height: DEVICE.height,
          borderRadius: DEVICE.radius,
          overflow: 'hidden',
          position: 'relative',
          background: colors.surface,
        }}
      >
        {children}

        {/* Ilha dinâmica */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 118,
            height: 34,
            borderRadius: 20,
            background: '#05060A',
            zIndex: 50,
          }}
        />
        {/* Reflexo diagonal no vidro */}
        {glare && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(125deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 34%)',
              pointerEvents: 'none',
              zIndex: 40,
            }}
          />
        )}
      </div>
    </div>
  )
}
