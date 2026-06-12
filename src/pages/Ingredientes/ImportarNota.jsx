import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import { processarNotaFiscal } from '../../api/ia'
import { listarIngredientes, criarIngrediente, adicionarPrecoIngrediente } from '../../api/ingredientes'

const UNIDADES = ['g', 'kg', 'ml', 'L', 'unid']
const hoje = () => new Date().toISOString().split('T')[0]

function normalizar(nome) {
  return nome.toLowerCase().trim()
}

export default function ImportarNota() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const inputRef = useRef()

  const [fase, setFase] = useState('upload') // upload | processando | revisao | salvando | concluido
  const [arquivo, setArquivo] = useState(null)
  const [dataCompra, setDataCompra] = useState(hoje())
  const [itens, setItens] = useState([])
  const [existentes, setExistentes] = useState([])
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
      const r = await processarNotaFiscal(arquivo)
      const data = r.data
      if (data.data_compra) setDataCompra(data.data_compra)
      setItens(
        (data.itens || []).map((item, idx) => {
          const nome = item.nome ?? item.nome_original ?? ''
          const match = matchIngrediente(nome)
          // peso_embalagem_g = peso de UMA embalagem → é o que vai em quantidade_embalagem
          // preco_unitario = preço de UMA embalagem → é o que vai em preco
          const temPeso = item.peso_embalagem_g != null && item.peso_embalagem_g > 0
          return {
            _id: idx,
            selecionado: true,
            nome,
            nome_original: item.nome_original ?? '',
            marca: item.marca ?? '',
            quantidade: temPeso ? item.peso_embalagem_g : (item.quantidade ?? 1),
            unidade: temPeso ? 'g' : (item.unidade ?? 'unid'),
            preco_total: item.preco_unitario ?? item.preco_total ?? 0,
            match,
            acao: match ? 'adicionar_preco' : 'criar_novo',
          }
        })
      )
      setFase('revisao')
    } catch (e) {
      setErro(e.message)
      setFase('upload')
    }
  }

  const atualizarItem = (idx, campo, valor) =>
    setItens((prev) =>
      prev.map((it) => {
        if (it._id !== idx) return it
        const atualizado = { ...it, [campo]: valor }
        if (campo === 'nome') {
          const m = matchIngrediente(valor)
          atualizado.match = m
          atualizado.acao = m ? 'adicionar_preco' : 'criar_novo'
        }
        return atualizado
      })
    )

  const selecionados = itens.filter((i) => i.selecionado)

  const salvar = async () => {
    setFase('salvando')
    const res = []
    // Evita criar ingrediente duplicado quando o mesmo nome aparece em
    // mais de um item da nota com ação "criar novo"
    const criadosNoLote = new Map()
    for (const item of selecionados) {
      try {
        let ingId
        const chave = normalizar(item.nome)
        if (item.acao === 'adicionar_preco' && item.match) {
          ingId = item.match.id
        } else if (criadosNoLote.has(chave)) {
          ingId = criadosNoLote.get(chave)
        } else {
          const r = await criarIngrediente({
            nome: item.nome,
            marca: item.marca || null,
            unidade: item.unidade,
            fator_correcao: 1.0,
          })
          ingId = r.data.id
          criadosNoLote.set(chave, ingId)
        }
        // quantidade_embalagem é interpretada na unidade do INGREDIENTE —
        // converte g↔kg / ml↔L quando a nota veio em unidade diferente
        const destino = item.acao === 'adicionar_preco' && item.match ? item.match.unidade : item.unidade
        const fconv = (u) => (u === 'kg' || u === 'L' ? 1000 : 1)
        const grupo = (u) => (u === 'g' || u === 'kg' ? 'massa' : u === 'ml' || u === 'L' ? 'volume' : 'unid')
        let quantidade = parseFloat(item.quantidade)
        if (grupo(item.unidade) === grupo(destino) && item.unidade !== destino) {
          quantidade = (quantidade * fconv(item.unidade)) / fconv(destino)
        }
        await adicionarPrecoIngrediente(ingId, {
          preco: parseFloat(item.preco_total),
          quantidade_embalagem: quantidade,
          data_compra: dataCompra + 'T12:00:00',
          origem: 'nota_fiscal_ia',
        })
        res.push({ nome: item.nome, ok: true })
      } catch (e) {
        res.push({ nome: item.nome, ok: false, msg: e.message })
      }
    }
    // Ingredientes e preços novos — invalida caches do TanStack Query
    queryClient.invalidateQueries({ queryKey: ['ingredientes'] })
    queryClient.invalidateQueries({ queryKey: ['ingrediente'] })
    queryClient.invalidateQueries({ queryKey: ['precos-produto'] })
    queryClient.invalidateQueries({ queryKey: ['relatorio-margem'] })
    setResultados(res)
    setFase('concluido')
  }

  // ── Upload ────────────────────────────────────────────────────────────────
  if (fase === 'upload') {
    return (
      <Layout title="Importar Nota Fiscal" onBack={() => navigate('/ingredientes')}>
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
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="font-mono text-xs uppercase tracking-widest text-mute">
              {arquivo ? arquivo.name : 'Toque para selecionar'}
            </p>
            <p className="font-mono text-[10px] text-mute mt-1">Foto, PDF — qualquer formato de nota</p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
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
      <Layout title="Importar Nota Fiscal" onBack={() => navigate('/ingredientes')}>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-8 h-8 border-2 border-lime/30 border-t-lime rounded-full animate-spin" />
          <p className="font-mono text-xs uppercase tracking-widest text-mute">Analisando nota...</p>
        </div>
      </Layout>
    )
  }

  // ── Revisão ───────────────────────────────────────────────────────────────
  if (fase === 'revisao') {
    return (
      <Layout title="Revisar Itens" onBack={() => setFase('upload')}>
        <div className="px-4 pt-4 pb-32">
          {/* Data da compra */}
          <div className="mb-4">
            <p className="label mb-1">Data da compra</p>
            <input type="date" className="input" value={dataCompra}
              onChange={(e) => setDataCompra(e.target.value)} />
          </div>

          <p className="label mb-3">{itens.length} itens extraídos — marque os que deseja cadastrar</p>

          <div className="space-y-3">
            {itens.map((item) => (
              <div key={item._id}
                className={`border p-3 ${item.selecionado ? 'border-ink bg-receipt' : 'border-line bg-bone opacity-50'}`}>
                {/* Linha 1: checkbox + nome */}
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={item.selecionado}
                    onChange={(e) => atualizarItem(item._id, 'selecionado', e.target.checked)}
                    className="mt-1 flex-shrink-0 w-4 h-4 accent-lime" />
                  <div className="flex-1 min-w-0">
                    <input
                      className="input w-full text-sm"
                      value={item.nome}
                      onChange={(e) => atualizarItem(item._id, 'nome', e.target.value)}
                    />
                    {item.nome_original && (
                      <p className="font-mono text-[10px] text-mute mt-0.5 truncate">{item.nome_original}</p>
                    )}
                  </div>
                </div>

                {/* Linha 1b: marca */}
                <div className="mt-1 ml-7">
                  <input
                    className="input w-full text-sm"
                    placeholder="Marca (opcional)"
                    value={item.marca}
                    onChange={(e) => atualizarItem(item._id, 'marca', e.target.value)}
                  />
                </div>

                {/* Linha 2: quantidade + unidade + preço */}
                <div className="flex gap-2 mt-2 ml-7">
                  <input type="number" step="0.001" className="input w-24 text-sm"
                    value={item.quantidade}
                    onChange={(e) => atualizarItem(item._id, 'quantidade', e.target.value)} />
                  <select className="input w-20 text-sm"
                    value={item.unidade}
                    onChange={(e) => atualizarItem(item._id, 'unidade', e.target.value)}>
                    {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-xs text-mute">R$</span>
                    <input type="number" step="0.01" className="input w-full pl-8 text-sm"
                      value={item.preco_total}
                      onChange={(e) => atualizarItem(item._id, 'preco_total', e.target.value)} />
                  </div>
                </div>

                {/* Match info */}
                {item.selecionado && (
                  <div className="ml-7 mt-2">
                    {item.match ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-lime text-ink px-2 py-0.5 uppercase tracking-widest">
                          Coincide
                        </span>
                        <span className="font-mono text-[10px] text-mute truncate">{item.match.nome}</span>
                        <button
                          type="button"
                          onClick={() => atualizarItem(item._id, 'acao', item.acao === 'adicionar_preco' ? 'criar_novo' : 'adicionar_preco')}
                          className="font-mono text-[10px] underline text-mute ml-auto flex-shrink-0">
                          {item.acao === 'adicionar_preco' ? 'Adicionar preço ao existente' : 'Criar novo'}
                        </button>
                        {item.acao === 'adicionar_preco' && item.match.unidade !== item.unidade && (
                          ['g', 'kg'].includes(item.unidade) === ['g', 'kg'].includes(item.match.unidade) &&
                          ['ml', 'L'].includes(item.unidade) === ['ml', 'L'].includes(item.match.unidade) ? (
                            <span className="font-mono text-[10px] text-mute flex-shrink-0">
                              → {item.match.unidade}
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] text-rust flex-shrink-0">
                              ⚠ {item.unidade}≠{item.match.unidade}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <span className="font-mono text-[10px] text-mute uppercase tracking-widest">Novo ingrediente</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Botão fixo */}
        <div className="fixed bottom-16 left-0 right-0 bg-bone border-t border-line px-4 py-3 z-30">
          <button onClick={salvar} disabled={selecionados.length === 0} className="btn-primary w-full max-w-xl mx-auto block">
            Salvar {selecionados.length} item{selecionados.length !== 1 ? 'ns' : ''}
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
          <p className="font-mono text-xs uppercase tracking-widest text-mute">Cadastrando ingredientes...</p>
        </div>
      </Layout>
    )
  }

  // ── Concluído ─────────────────────────────────────────────────────────────
  const erros = resultados.filter((r) => !r.ok)
  return (
    <Layout title="Importação concluída" onBack={() => navigate('/ingredientes')}>
      <div className="px-4 pt-6 space-y-4">
        <div className="border border-lime bg-lime/10 px-4 py-3">
          <p className="font-mono text-sm text-ink">
            {resultados.filter((r) => r.ok).length} ingrediente(s) cadastrado(s) com sucesso.
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
        <button onClick={() => navigate('/ingredientes')} className="btn-primary w-full max-w-xl mx-auto block">
          Ver ingredientes
        </button>
        <button onClick={() => { setFase('upload'); setArquivo(null); setItens([]); setResultados([]) }}
          className="btn-ghost w-full">
          Importar outra nota
        </button>
      </div>
    </Layout>
  )
}
