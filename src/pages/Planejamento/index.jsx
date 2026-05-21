import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { listarReceitas, detalharReceita } from '../../api/receitas'

const fmtQtd = (n) => {
  const v = Math.round(n * 100) / 100
  if (v === 0) return '0'
  if (v % 1 === 0) return v.toString()
  return v.toFixed(2).replace('.', ',')
}

const fmtR = (n) => `R$ ${n.toFixed(2).replace('.', ',')}`

const fmtPeso = (g) => {
  if (g >= 1000) {
    const kg = g / 1000
    const s = kg % 1 === 0 ? kg.toString() : kg.toFixed(2).replace('.', ',')
    return `${s} kg`
  }
  return `${Math.round(g)} g`
}

export default function Planejamento() {
  const navigate = useNavigate()
  const [receitas, setReceitas] = useState([])
  const [receitaId, setReceitaId] = useState('')
  const [detalhe, setDetalhe] = useState(null)
  const [loadingDetalhe, setLoadingDetalhe] = useState(false)
  const [modo, setModo] = useState('peso')
  const [pesoTotal, setPesoTotal] = useState('')
  const [unidadePeso, setUnidadePeso] = useState('g')
  const [numPorcoes, setNumPorcoes] = useState('')
  const [pesoPorcao, setPesoPorcao] = useState('')

  useEffect(() => {
    listarReceitas().then((r) => setReceitas(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!receitaId) { setDetalhe(null); return }
    setLoadingDetalhe(true)
    detalharReceita(receitaId)
      .then((r) => setDetalhe(r.data))
      .catch(() => setDetalhe(null))
      .finally(() => setLoadingDetalhe(false))
  }, [receitaId])

  const resultado = useMemo(() => {
    if (!detalhe) return null

    let targetG = 0
    if (modo === 'peso') {
      const v = parseFloat(pesoTotal)
      if (!v || v <= 0) return null
      targetG = unidadePeso === 'kg' ? v * 1000 : v
    } else {
      const np = parseInt(numPorcoes)
      const pp = parseFloat(pesoPorcao)
      if (!np || !pp || np <= 0 || pp <= 0) return null
      targetG = np * pp
    }

    if (detalhe.rendimento_g <= 0) return null
    const fator = targetG / detalhe.rendimento_g

    return {
      fator,
      targetG,
      ingredientes: detalhe.ingredientes.map((i) => ({
        nome: i.ingrediente_nome,
        unidade: i.unidade,
        quantidade: i.quantidade_g * fator,
        custo: i.custo * fator,
      })),
      custo_mp: detalhe.custo_mp_total * fator,
      custo_mo: detalhe.custo_mo_total * fator,
      custo_total: detalhe.custo_total * fator,
      custo_porcao:
        modo === 'porcoes' && parseInt(numPorcoes) > 0
          ? (detalhe.custo_total * fator) / parseInt(numPorcoes)
          : null,
    }
  }, [detalhe, modo, pesoTotal, unidadePeso, numPorcoes, pesoPorcao])

  const totalPorcoesG =
    modo === 'porcoes' && numPorcoes && pesoPorcao
      ? (parseInt(numPorcoes) || 0) * (parseFloat(pesoPorcao) || 0)
      : 0

  return (
    <Layout title="Produção" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4 space-y-5 pb-6">

        {/* Selecionar receita */}
        <div>
          <p className="label">Receita</p>
          <select
            value={receitaId}
            onChange={(e) => { setReceitaId(e.target.value); setPesoTotal(''); setNumPorcoes(''); setPesoPorcao('') }}
            className="input w-full"
          >
            <option value="">Selecionar receita...</option>
            {receitas.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nome}{r.tipo ? ` (${r.tipo})` : ''}
              </option>
            ))}
          </select>
          {detalhe && !loadingDetalhe && (
            <p className="font-mono text-[10px] text-mute mt-1 uppercase tracking-widest">
              Rendimento base: {fmtPeso(detalhe.rendimento_g)}
            </p>
          )}
        </div>

        {loadingDetalhe && <LoadingSpinner />}

        {detalhe && !loadingDetalhe && (
          <>
            {/* Modo */}
            <div>
              <p className="label">Calcular por</p>
              <div className="flex">
                <button
                  onClick={() => setModo('peso')}
                  className={`flex-1 py-2.5 font-mono text-xs uppercase tracking-widest border ${
                    modo === 'peso'
                      ? 'bg-ink text-bone border-ink'
                      : 'bg-bone text-mute border-line'
                  }`}
                >
                  Peso total
                </button>
                <button
                  onClick={() => setModo('porcoes')}
                  className={`flex-1 py-2.5 font-mono text-xs uppercase tracking-widest border-t border-b border-r ${
                    modo === 'porcoes'
                      ? 'bg-ink text-bone border-ink'
                      : 'bg-bone text-mute border-line'
                  }`}
                >
                  Por porções
                </button>
              </div>
            </div>

            {/* Inputs — Por peso */}
            {modo === 'peso' && (
              <div>
                <p className="label">Quantidade desejada</p>
                <div className="flex">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    placeholder={unidadePeso === 'kg' ? 'ex: 1' : 'ex: 1000'}
                    value={pesoTotal}
                    onChange={(e) => setPesoTotal(e.target.value)}
                    className="input flex-1"
                  />
                  <button
                    onClick={() => setUnidadePeso((u) => (u === 'g' ? 'kg' : 'g'))}
                    className="bg-ink text-bone font-mono text-xs uppercase tracking-widest px-5 border border-l-0 border-ink flex-shrink-0 active:opacity-80"
                  >
                    {unidadePeso}
                  </button>
                </div>
              </div>
            )}

            {/* Inputs — Por porções */}
            {modo === 'porcoes' && (
              <div className="space-y-3">
                <div>
                  <p className="label">Número de porções</p>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    placeholder="ex: 30"
                    value={numPorcoes}
                    onChange={(e) => setNumPorcoes(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <p className="label">Peso por porção</p>
                  <div className="flex">
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      placeholder="ex: 200"
                      value={pesoPorcao}
                      onChange={(e) => setPesoPorcao(e.target.value)}
                      className="input flex-1"
                    />
                    <span className="bg-ink text-bone font-mono text-xs uppercase tracking-widest px-5 border border-l-0 border-ink flex-shrink-0 flex items-center">
                      g
                    </span>
                  </div>
                </div>
                {totalPorcoesG > 0 && (
                  <p className="font-mono text-[10px] text-mute uppercase tracking-widest">
                    Total: {numPorcoes} × {pesoPorcao}g = {fmtPeso(totalPorcoesG)}
                  </p>
                )}
              </div>
            )}

            {/* Resultado */}
            {resultado && (
              <div className="space-y-4 border-t-2 border-ink pt-4">

                {/* Cabeçalho do resultado */}
                <div className="flex items-baseline gap-3">
                  <span className="qtm-num text-4xl font-bold text-ink">
                    ×{resultado.fator % 1 === 0
                      ? resultado.fator.toString()
                      : resultado.fator.toFixed(2).replace('.', ',')}
                  </span>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-mute">
                      {fmtPeso(resultado.targetG)}
                    </p>
                    {modo === 'porcoes' && (
                      <p className="font-mono text-[10px] text-mute">
                        {numPorcoes} porções de {pesoPorcao}g
                      </p>
                    )}
                  </div>
                </div>

                {/* Ingredientes escalados */}
                <div>
                  <p className="label mb-2">Ingredientes necessários</p>
                  <div className="border border-line">
                    {resultado.ingredientes.map((ing, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2.5 border-b border-line last:border-b-0"
                      >
                        <span className="text-sm text-ink font-medium flex-1 min-w-0 truncate pr-3">
                          {ing.nome}
                        </span>
                        <span className="qtm-num text-sm text-ink font-mono flex-shrink-0">
                          {fmtQtd(ing.quantidade)} {ing.unidade}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custos escalados */}
                <div>
                  <p className="label mb-2">Custo de produção</p>
                  <div className="border border-line">
                    <div className="flex items-center justify-between px-3 py-2.5 border-b border-line">
                      <span className="font-mono text-xs uppercase tracking-widest text-mute">Matéria-prima</span>
                      <span className="qtm-num text-sm text-ink">{fmtR(resultado.custo_mp)}</span>
                    </div>
                    {resultado.custo_mo > 0 && (
                      <div className="flex items-center justify-between px-3 py-2.5 border-b border-line">
                        <span className="font-mono text-xs uppercase tracking-widest text-mute">Mão de obra</span>
                        <span className="qtm-num text-sm text-ink">{fmtR(resultado.custo_mo)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between px-3 py-2.5 bg-lime">
                      <span className="font-mono text-xs uppercase tracking-widest text-ink font-bold">Total</span>
                      <span className="qtm-num text-sm text-ink font-bold">{fmtR(resultado.custo_total)}</span>
                    </div>
                    {resultado.custo_porcao !== null && (
                      <div className="flex items-center justify-between px-3 py-2.5 bg-receipt border-t border-line">
                        <span className="font-mono text-xs uppercase tracking-widest text-mute">Por porção</span>
                        <span className="qtm-num text-sm text-ink">{fmtR(resultado.custo_porcao)}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </>
        )}

      </div>
    </Layout>
  )
}
