import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { listarCanais } from '../api/precificacao'
import { brl } from '../utils/format'

// Simulador "e se": preço derivado em tempo real da fórmula de precificação
// preco = custo / (1 − margem − taxas)
export default function SimuladorPreco({ custo }) {
  const [margem, setMargem] = useState(30)
  const [taxas, setTaxas] = useState(21)

  // Inicializa as taxas com o primeiro canal real do usuário (ex: iFood);
  // depois que o usuário mexe no slider, não sobrescreve mais
  const tocouTaxas = useRef(false)
  const { data: canais } = useQuery({
    queryKey: ['canais'],
    queryFn: () => listarCanais().then((r) => r.data),
  })
  useEffect(() => {
    if (tocouTaxas.current || !canais?.length) return
    const c = canais[0]
    const total = Math.round((c.taxa_plataforma_pct || 0) + (c.taxa_cartao_pct || 0) + (c.imposto_pct || 0))
    setTaxas(Math.min(40, Math.max(0, total)))
  }, [canais])

  const divisor = 1 - margem / 100 - taxas / 100
  const preco = divisor > 0 ? custo / divisor : null
  const lucro = preco ? preco * (margem / 100) : null

  return (
    <div className="card mt-4">
      <p className="label mb-3">Simulador de preço</p>
      <div className="flex justify-between mb-1">
        <span className="font-mono text-[10px] uppercase tracking-widest text-mute">Margem</span>
        <span className="qtm-num text-xs font-bold text-ink">{margem}%</span>
      </div>
      <input
        type="range" min="0" max="70" step="1" value={margem}
        onChange={(e) => setMargem(parseInt(e.target.value))}
        className="w-full accent-lime"
      />
      <div className="flex justify-between mb-1 mt-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-mute">Taxas (plataforma+cartão+imposto)</span>
        <span className="qtm-num text-xs font-bold text-ink">{taxas}%</span>
      </div>
      <input
        type="range" min="0" max="40" step="1" value={taxas}
        onChange={(e) => { tocouTaxas.current = true; setTaxas(parseInt(e.target.value)) }}
        className="w-full accent-lime"
      />
      <div className="flex justify-between items-end mt-4 pt-3 border-t border-line">
        <div>
          <p className="label">Custo</p>
          <p className="qtm-num text-sm text-ink">{brl(custo)}</p>
        </div>
        <div className="text-center">
          <p className="label">Preço de venda</p>
          {preco ? (
            <p className="qtm-num text-lg font-bold text-ink bg-lime px-2">{brl(preco)}</p>
          ) : (
            <p className="font-mono text-[10px] uppercase tracking-widest text-rust">Margem + taxas ≥ 100%</p>
          )}
        </div>
        <div className="text-right">
          <p className="label">Lucro</p>
          <p className="qtm-num text-sm text-ink">{lucro ? brl(lucro) : '—'}</p>
        </div>
      </div>
    </div>
  )
}
