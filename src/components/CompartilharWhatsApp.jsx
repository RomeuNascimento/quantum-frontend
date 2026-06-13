import { useState } from 'react'

// Botões de compartilhar texto por WhatsApp + copiar. Abre o wa.me sem número
// (o usuário escolhe o contato/grupo, ou manda pra si mesmo). `print:hidden`
// para não aparecer ao salvar a ficha em PDF.
export default function CompartilharWhatsApp({ texto, label = 'Enviar por WhatsApp', className = '' }) {
  const [copiado, setCopiado] = useState(false)

  const enviar = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')
  }

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch { /* clipboard indisponível — sem ação */ }
  }

  return (
    <div className={`flex gap-2 print:hidden ${className}`}>
      <button type="button" onClick={enviar} className="btn-primary flex-1">{label}</button>
      <button type="button" onClick={copiar} className="btn-ghost w-auto px-4 whitespace-nowrap">
        {copiado ? 'Copiado ✓' : 'Copiar'}
      </button>
    </div>
  )
}
