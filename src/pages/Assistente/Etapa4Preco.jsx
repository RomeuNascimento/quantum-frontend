import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listarCanais } from '../../api/precificacao'
import { brl } from '../../utils/format'

// ── Etapa 4 do Assistente — PREÇO FINAL ────────────────────────────────────────
// Custo total (MP+MO) → custo por porção/unidade → preço de venda por margem.
// Lidera com UM preço recomendado (venda direta, sem taxa); canais com taxas reais
// ficam num bloco opcional. Fórmula = custo / (1 − (margem + taxas)/100).

function Bolha({ children }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 flex-shrink-0 bg-ink text-lime flex items-center justify-center font-mono text-sm font-bold">Q</div>
      <div className="flex-1 bg-receipt border border-line px-4 py-3">{children}</div>
    </div>
  )
}

const MARGEM_PADRAO = 50

const taxasCanal = (c) => (c.taxa_plataforma_pct || 0) + (c.taxa_cartao_pct || 0) + (c.imposto_pct || 0)
const precoCom = (custo, margem, taxasPct = 0) => {
  const div = 1 - (margem + taxasPct) / 100
  return div > 0 ? custo / div : 0
}

export default function Etapa4Preco({ custoTotal, receita, onConcluir }) {
  const canaisQ = useQuery({ queryKey: ['canais'], queryFn: () => listarCanais().then((r) => r.data) })

  const [porcoes, setPorcoes] = useState(1)
  const [margem, setMargem] = useState(MARGEM_PADRAO)
  const [verCanais, setVerCanais] = useState(false)

  const n = Math.max(parseFloat(porcoes) || 1, 1)
  const custoUnit = custoTotal / n
  const precoDireto = precoCom(custoUnit, margem)
  const lucroDireto = precoDireto - custoUnit
  const canais = (canaisQ.data || []).filter((c) => c.ativo !== false)

  return (
    <div className="px-4 pt-5 pb-28 space-y-4">
      <Bolha>
        <p className="font-sans text-sm text-ink">
          Última etapa! Esse <strong>{receita?.nome || 'produto'}</strong> custou{' '}
          <strong>{brl(custoTotal)}</strong> pra fazer. Vamos achar o preço de venda. 💰
        </p>
      </Bolha>

      {/* Porções */}
      <div className="border border-line bg-bone px-3 py-3">
        <p className="label">Rende quantas porções / unidades?</p>
        <div className="flex items-center gap-2">
          <input type="number" inputMode="numeric" className="input w-24 text-sm" value={porcoes}
            onChange={(e) => setPorcoes(e.target.value)} aria-label="Número de porções" />
          <span className="font-mono text-xs text-mute">
            {n === 1 ? 'vendo inteiro' : `→ ${brl(custoUnit)} de custo cada`}
          </span>
        </div>
      </div>

      {/* Preço recomendado (venda direta) */}
      <div className="border border-ink bg-ink text-bone">
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase tracking-widest text-mute">Preço recomendado</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-mute">venda direta</span>
        </div>
        <div className="px-4 pb-1">
          <span className="qtm-num text-4xl font-bold text-lime">{brl(precoDireto)}</span>
          {n > 1 && <span className="font-mono text-xs text-mute ml-2">por unidade</span>}
        </div>
        <div className="px-4 pb-3">
          <span className="font-mono text-[11px] text-bone/70">
            Lucro de <span className="qtm-num text-bone">{brl(lucroDireto)}</span> por {n > 1 ? 'unidade' : 'receita'}
          </span>
        </div>

        {/* Slider de margem */}
        <div className="px-4 pb-4 pt-1 border-t border-plasma">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[11px] uppercase tracking-widest text-mute">Margem</span>
            <span className="qtm-num text-sm text-lime font-bold">{margem}%</span>
          </div>
          <input type="range" min="0" max="90" step="5" value={margem}
            onChange={(e) => setMargem(parseInt(e.target.value))}
            aria-label="Margem de lucro" className="w-full accent-lime" />
        </div>
      </div>

      {/* Canais opcionais */}
      <div className="border border-line">
        <button onClick={() => setVerCanais((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 active:bg-line/40">
          <span className="font-mono text-xs uppercase tracking-widest text-ink">
            Vende em iFood, etc.? Ver preço por canal
          </span>
          <svg className={`w-4 h-4 text-mute transition-transform ${verCanais ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
            strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {verCanais && (
          <div className="border-t border-line">
            {canais.length === 0 ? (
              <p className="px-4 py-3 font-sans text-sm text-mute">
                Nenhum canal cadastrado. Você pode adicionar depois em Preços.
              </p>
            ) : (
              canais.map((c) => {
                const preco = precoCom(custoUnit, margem, taxasCanal(c))
                return (
                  <div key={c.id} className="flex items-center justify-between px-4 py-2.5 border-b border-line last:border-b-0">
                    <div>
                      <p className="font-sans text-sm text-ink">{c.nome}</p>
                      <p className="font-mono text-[10px] text-mute">taxas {taxasCanal(c).toFixed(1)}%</p>
                    </div>
                    <span className="qtm-num text-sm text-ink">{brl(preco)}</span>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-bone border-t border-line px-4 py-3 z-30">
        <button
          onClick={() => onConcluir({ porcoes: n, margem, custoUnit, precoDireto, lucroDireto })}
          className="btn-primary w-full max-w-xl mx-auto block">
          Finalizar →
        </button>
      </div>
    </div>
  )
}
