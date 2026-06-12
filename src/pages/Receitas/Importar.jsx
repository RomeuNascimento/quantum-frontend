import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import { processarReceitas } from '../../api/ia'
import { listarIngredientes, criarIngrediente } from '../../api/ingredientes'
import { criarReceita } from '../../api/receitas'

function normalizar(nome) {
  return nome.toLowerCase().trim()
}

export default function ImportarReceitas() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const inputRef = useRef()

  const [fase, setFase] = useState('upload')
  const [arquivo, setArquivo] = useState(null)
  const [receitas, setReceitas] = useState([])
  const [existentes, setExistentes] = useState([])
  const [expandidos, setExpandidos] = useState({})
  const [erro, setErro] = useState('')
  const [resultados, setResultados] = useState([])

  useEffect(() => {
    listarIngredientes().then((r) => setExistentes(r.data))
  }, [])

  const matchIngrediente = (nome) =>
    existentes.find((e) => normalizar(e.nome) === normalizar(nome)) || null

  const processarArquivo = async () => {
    if (!arquivo) return
    setErro('')
    setFase('processando')
    try {
      const r = await processarReceitas(arquivo)
      const dados = r.data.receitas || []
      setReceitas(
        dados.map((rec, i) => ({
          _id: i,
          selecionada: true,
          nome: rec.nome,
          tipo: rec.tipo || '',
          rendimento_g: rec.rendimento_g || 100,
          ingredientes: (rec.ingredientes || []).map((ing) => ({
            nome: ing.nome,
            quantidade_g: ing.quantidade_g,
            match: matchIngrediente(ing.nome),
          })),
          etapas_mo: rec.etapas_mo || [],
        }))
      )
      setExpandidos(Object.fromEntries(dados.map((_, i) => [i, true])))
      setFase('revisao')
    } catch (e) {
      setErro(e.message)
      setFase('upload')
    }
  }

  const toggleExpand = (id) =>
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }))

  const atualizarReceita = (id, campo, valor) =>
    setReceitas((prev) => prev.map((r) => r._id === id ? { ...r, [campo]: valor } : r))

  const selecionadas = receitas.filter((r) => r.selecionada)

  const salvar = async () => {
    setFase('salvando')
    const res = []
    // Ingredientes criados neste lote, por nome normalizado — o `match` foi
    // calculado uma única vez no processamento, então sem este cache o mesmo
    // nome repetido em duas receitas criaria ingredientes duplicados
    const criadosNoLote = new Map()

    for (const rec of selecionadas) {
      try {
        // Resolve ingredient IDs — create new ones if needed
        const ingsResolvidos = []
        for (const ing of rec.ingredientes) {
          const chave = normalizar(ing.nome)
          let ingId = ing.match?.id || criadosNoLote.get(chave)
          if (!ingId) {
            const r = await criarIngrediente({ nome: ing.nome, unidade: 'g', fator_correcao: 1.0 })
            ingId = r.data.id
            criadosNoLote.set(chave, ingId)
            setExistentes((prev) => [...prev, r.data])
          }
          ingsResolvidos.push({ ingrediente_id: ingId, quantidade_g: parseFloat(ing.quantidade_g) || 0 })
        }

        await criarReceita({
          nome: rec.nome,
          tipo: rec.tipo || null,
          rendimento_g: parseFloat(rec.rendimento_g),
          ingredientes: ingsResolvidos,
          etapas_mo: rec.etapas_mo.map((e) => ({
            descricao: e.descricao,
            tempo_min: parseFloat(e.tempo_min) || 0,
          })),
        })
        res.push({ nome: rec.nome, ok: true })
      } catch (e) {
        res.push({ nome: rec.nome, ok: false, msg: e.message })
      }
    }

    // Receitas e ingredientes novos — invalida caches do TanStack Query
    queryClient.invalidateQueries({ queryKey: ['receitas'] })
    queryClient.invalidateQueries({ queryKey: ['ingredientes'] })
    setResultados(res)
    setFase('concluido')
  }

  // ── Upload ────────────────────────────────────────────────────────────────
  if (fase === 'upload') {
    return (
      <Layout title="Importar Receitas" onBack={() => navigate('/receitas')}>
        <div className="px-4 pt-6 space-y-6">
          {erro && (
            <div className="bg-rust/10 border border-rust px-3 py-2">
              <p className="font-mono text-xs text-rust">{erro}</p>
            </div>
          )}

          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-line bg-receipt flex flex-col items-center justify-center py-12 cursor-pointer active:bg-line"
          >
            <svg className="w-10 h-10 text-mute mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-mono text-xs uppercase tracking-widest text-mute">
              {arquivo ? arquivo.name : 'Toque para selecionar'}
            </p>
            <p className="font-mono text-[10px] text-mute mt-1">Foto, PDF, Excel, CSV — qualquer formato</p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf,.xlsx,.xls,.csv,.txt"
            className="hidden"
            onChange={(e) => setArquivo(e.target.files[0] || null)}
          />

          {arquivo && (
            <button onClick={processarArquivo} className="btn-primary w-full max-w-xl mx-auto block">
              Processar com IA
            </button>
          )}
        </div>
      </Layout>
    )
  }

  // ── Processando ───────────────────────────────────────────────────────────
  if (fase === 'processando') {
    return (
      <Layout title="Importar Receitas" onBack={() => navigate('/receitas')}>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-8 h-8 border-2 border-lime/30 border-t-lime rounded-full animate-spin" />
          <p className="font-mono text-xs uppercase tracking-widest text-mute">Analisando receitas...</p>
        </div>
      </Layout>
    )
  }

  // ── Revisão ───────────────────────────────────────────────────────────────
  if (fase === 'revisao') {
    return (
      <Layout title="Revisar Receitas" onBack={() => setFase('upload')}>
        <div className="px-4 pt-4 pb-32 space-y-3">
          <p className="label">{receitas.length} receita(s) extraída(s)</p>

          {receitas.map((rec) => (
            <div key={rec._id}
              className={`border ${rec.selecionada ? 'border-ink bg-receipt' : 'border-line bg-bone opacity-50'}`}>
              {/* Header do card */}
              <div className="flex items-start gap-3 p-3">
                <input type="checkbox" checked={rec.selecionada}
                  onChange={(e) => atualizarReceita(rec._id, 'selecionada', e.target.checked)}
                  className="mt-1 flex-shrink-0 w-4 h-4 accent-lime" />
                <div className="flex-1 min-w-0">
                  <input className="input w-full text-sm font-medium" value={rec.nome}
                    onChange={(e) => atualizarReceita(rec._id, 'nome', e.target.value)} />
                  <div className="flex gap-2 mt-2">
                    <input className="input flex-1 text-xs" placeholder="Tipo / Categoria (opcional)"
                      value={rec.tipo}
                      onChange={(e) => atualizarReceita(rec._id, 'tipo', e.target.value)} />
                    <div className="relative w-28">
                      <input type="number" step="1" className="input w-full text-xs pr-1"
                        value={rec.rendimento_g}
                        onChange={(e) => atualizarReceita(rec._id, 'rendimento_g', e.target.value)} />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-mute">g</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => toggleExpand(rec._id)}
                  className="p-1 text-mute flex-shrink-0">
                  <svg className={`w-4 h-4 transition-transform ${expandidos[rec._id] ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Ingredientes e etapas */}
              {expandidos[rec._id] && (
                <div className="border-t border-line px-3 pb-3 pt-2 space-y-3">
                  {/* Ingredientes */}
                  <div>
                    <p className="label mb-1">Ingredientes ({rec.ingredientes.length})</p>
                    <div className="space-y-1">
                      {rec.ingredientes.map((ing, ii) => (
                        <div key={ii} className="flex items-center gap-2">
                          <span className={`w-2 h-2 flex-shrink-0 rounded-full ${ing.match ? 'bg-lime' : 'bg-rust'}`} />
                          <span className="font-mono text-xs text-ink flex-1 truncate">{ing.nome}</span>
                          <span className="font-mono text-xs text-mute qtm-num">{ing.quantidade_g}g</span>
                        </div>
                      ))}
                    </div>
                    {rec.ingredientes.some((i) => !i.match) && (
                      <p className="font-mono text-[10px] text-rust mt-1">
                        Ingredientes em vermelho serão criados automaticamente (sem preço cadastrado).
                      </p>
                    )}
                  </div>

                  {/* Etapas */}
                  {rec.etapas_mo.length > 0 && (
                    <div>
                      <p className="label mb-1">Etapas ({rec.etapas_mo.length})</p>
                      <div className="space-y-1">
                        {rec.etapas_mo.map((e, ei) => (
                          <div key={ei} className="flex gap-2 items-start">
                            <span className="font-mono text-xs text-mute qtm-num w-10 flex-shrink-0">{e.tempo_min}min</span>
                            <span className="font-mono text-xs text-ink">{e.descricao}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="fixed bottom-16 left-0 right-0 bg-bone border-t border-line px-4 py-3 z-30">
          <button onClick={salvar} disabled={selecionadas.length === 0} className="btn-primary w-full max-w-xl mx-auto block">
            Salvar {selecionadas.length} receita{selecionadas.length !== 1 ? 's' : ''}
          </button>
        </div>
      </Layout>
    )
  }

  // ── Salvando ──────────────────────────────────────────────────────────────
  if (fase === 'salvando') {
    return (
      <Layout title="Salvando...">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-8 h-8 border-2 border-lime/30 border-t-lime rounded-full animate-spin" />
          <p className="font-mono text-xs uppercase tracking-widest text-mute">Cadastrando receitas...</p>
        </div>
      </Layout>
    )
  }

  // ── Concluído ─────────────────────────────────────────────────────────────
  const erros = resultados.filter((r) => !r.ok)
  return (
    <Layout title="Importação concluída" onBack={() => navigate('/receitas')}>
      <div className="px-4 pt-6 space-y-4">
        <div className="border border-lime bg-lime/10 px-4 py-3">
          <p className="font-mono text-sm text-ink">
            {resultados.filter((r) => r.ok).length} receita(s) cadastrada(s) com sucesso.
          </p>
        </div>
        {erros.length > 0 && (
          <div className="border border-rust bg-rust/10 px-4 py-3 space-y-1">
            <p className="font-mono text-xs text-rust uppercase tracking-widest mb-1">Erros</p>
            {erros.map((r, i) => (
              <p key={i} className="font-mono text-xs text-rust">{r.nome}: {r.msg}</p>
            ))}
          </div>
        )}
        <button onClick={() => navigate('/receitas')} className="btn-primary w-full max-w-xl mx-auto block">
          Ver receitas
        </button>
        <button onClick={() => { setFase('upload'); setArquivo(null); setReceitas([]); setResultados([]) }}
          className="btn-ghost w-full">
          Importar outro arquivo
        </button>
      </div>
    </Layout>
  )
}
