import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import FormField from '../../components/FormField'
import ConfirmDialog from '../../components/ConfirmDialog'
import useAuthStore from '../../store/authStore'
import { getMe, getConfiguracao, updateConfiguracao, alterarSenha, logoutAll } from '../../api/auth'
import { sugerirValorHora } from '../../api/ia'
import { brl, parseDecimal } from '../../utils/format'

// Chaves cujos cálculos dependem do valor-hora (custo de mão de obra)
const CHAVES_CUSTO = ['receitas', 'produtos', 'relatorio-margem', 'precos-produto', 'receita', 'produto', 'historico-custo-produto']

export default function Configuracoes() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, setUser, setToken, logout } = useAuthStore()

  const [valorHora, setValorHora] = useState('')
  const [vhPreenchido, setVhPreenchido] = useState(false)
  const [vhMsg, setVhMsg] = useState(null)
  const [vhSalvando, setVhSalvando] = useState(false)

  // Ajudas pra quem não sabe o próprio valor-hora: calculadora por salário e sugestão da IA
  const [ajuda, setAjuda] = useState(null) // null | 'salario' | 'ia'
  const [salario, setSalario] = useState('')
  const [horasMes, setHorasMes] = useState('')
  const [atividade, setAtividade] = useState('')
  const [sugerindo, setSugerindo] = useState(false)
  const [sugestao, setSugestao] = useState(null)
  const [sugErro, setSugErro] = useState('')

  const [senhaAtual, setSenhaAtual] = useState('')
  const [senhaNova, setSenhaNova] = useState('')
  const [senhaConf, setSenhaConf] = useState('')
  const [senhaMsg, setSenhaMsg] = useState(null)
  const [senhaSalvando, setSenhaSalvando] = useState(false)

  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false)

  const meQ = useQuery({ queryKey: ['me'], queryFn: () => getMe().then((r) => r.data) })
  const configQ = useQuery({ queryKey: ['configuracao'], queryFn: () => getConfiguracao().then((r) => r.data) })

  useEffect(() => { if (meQ.data) setUser(meQ.data) }, [meQ.data, setUser])
  useEffect(() => {
    if (configQ.data && !vhPreenchido) {
      const v = configQ.data.valor_hora_padrao
      setValorHora(v ? String(v) : '')
      setVhPreenchido(true)
    }
  }, [configQ.data, vhPreenchido])

  const conta = meQ.data || user

  // Calculadora "quanto quero ganhar por mês" → valor-hora (mesma conta da Etapa 3)
  const vhCalculado = parseDecimal(salario) > 0 && parseDecimal(horasMes) > 0
    ? parseDecimal(salario) / parseDecimal(horasMes)
    : 0

  const usarCalculado = () => {
    setValorHora(vhCalculado.toFixed(2).replace('.', ','))
    setSugestao(null); setVhMsg(null); setAjuda(null)
  }

  const pedirSugestao = async () => {
    if (!atividade.trim()) {
      setSugErro('Escreva o que você faz. Ex.: bolos e doces')
      return
    }
    setSugErro(''); setSugerindo(true)
    try {
      const r = await sugerirValorHora(`faz ${atividade.trim()} para vender`)
      setValorHora(String(r.data.valor_hora).replace('.', ','))
      setSugestao(r.data)
      setVhMsg(null); setAjuda(null)
    } catch (e) {
      setSugErro(e.message)
    } finally {
      setSugerindo(false)
    }
  }

  const salvarValorHora = async () => {
    const raw = String(valorHora).trim()
    // aceita vírgula decimal mas preserva a detecção de texto inválido (NaN)
    const norm = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw
    const v = raw === '' ? 0 : parseFloat(norm)
    if (isNaN(v) || v < 0) {
      setVhMsg({ tipo: 'erro', texto: 'Informe um valor válido (0 ou mais).' })
      return
    }
    setVhSalvando(true); setVhMsg(null)
    try {
      await updateConfiguracao({ valor_hora_padrao: v })
      // O valor-hora entra no custo de mão de obra — recalcula onde aparece
      CHAVES_CUSTO.forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }))
      queryClient.invalidateQueries({ queryKey: ['configuracao'] })
      setVhMsg({ tipo: 'ok', texto: 'Valor salvo ✓' })
    } catch (e) {
      setVhMsg({ tipo: 'erro', texto: e.message })
    } finally {
      setVhSalvando(false)
    }
  }

  const trocarSenha = async (e) => {
    e.preventDefault()
    setSenhaMsg(null)
    if (senhaNova.length < 8) {
      setSenhaMsg({ tipo: 'erro', texto: 'A nova senha precisa ter pelo menos 8 caracteres.' })
      return
    }
    if (senhaNova !== senhaConf) {
      setSenhaMsg({ tipo: 'erro', texto: 'A confirmação não bate com a nova senha.' })
      return
    }
    setSenhaSalvando(true)
    try {
      const r = await alterarSenha({ senha_atual: senhaAtual, senha_nova: senhaNova })
      // Token novo: o backend invalidou os anteriores (inclusive o deste device)
      setToken(r.data.access_token)
      setSenhaAtual(''); setSenhaNova(''); setSenhaConf('')
      setSenhaMsg({ tipo: 'ok', texto: 'Senha alterada ✓ As outras sessões foram desconectadas.' })
    } catch (e) {
      setSenhaMsg({ tipo: 'erro', texto: e.message })
    } finally {
      setSenhaSalvando(false)
    }
  }

  const sairDeTudo = async () => {
    setConfirmLogoutAll(false)
    try { await logoutAll() } catch { /* o token cai de qualquer forma */ }
    logout()
    navigate('/login')
  }

  if (meQ.isLoading && !user) {
    return (
      <Layout title="Configurações" onBack={() => navigate('/dashboard')}>
        <div className="px-4 pt-10"><LoadingSpinner /></div>
      </Layout>
    )
  }

  return (
    <Layout title="Configurações" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4 pb-8 space-y-6">

        {/* Conta */}
        <section>
          <p className="label mb-2">Conta</p>
          <div className="card space-y-0.5">
            <p className="text-sm text-on-surface font-semibold">{conta?.nome || '—'}</p>
            <p className="text-sm text-on-surface-dim break-all">{conta?.email || '—'}</p>
          </div>
        </section>

        {/* Mão de obra */}
        <section>
          <p className="label mb-2">Mão de obra</p>
          <div className="card space-y-2">
            <label htmlFor="vh" className="text-sm text-on-surface block">Valor da sua hora de trabalho (R$)</label>
            <input id="vh" className="input qtm-num" inputMode="decimal" value={valorHora}
              onChange={(e) => { setValorHora(e.target.value); setVhMsg(null); setSugestao(null) }} placeholder="Ex.: 20" />
            {sugestao && (
              <p className="text-sm text-on-surface">
                <span className="badge bg-warm text-on-warm mr-1.5">EST</span>
                {sugestao.explicacao || 'Valor aproximado de mercado — ajuste se quiser.'}
              </p>
            )}
            <p className="text-xs text-on-surface-dim">
              Usado pra calcular o custo de mão de obra nas receitas e produtos.
            </p>

            {/* Ajudas pra quem não sabe o valor */}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <button type="button" onClick={() => setAjuda(ajuda === 'salario' ? null : 'salario')}
                className="font-sans text-[13px] font-semibold text-primary underline underline-offset-2">
                Calcular pelo que quero ganhar
              </button>
              <button type="button" onClick={() => setAjuda(ajuda === 'ia' ? null : 'ia')}
                className="font-sans text-[13px] font-semibold text-primary underline underline-offset-2">
                🤖 Não sei — me sugere
              </button>
            </div>

            {ajuda === 'salario' && (
              <div className="border border-outline rounded-xl bg-surface-1 px-3 py-3 space-y-2">
                <p className="text-sm text-on-surface">Quanto você quer ganhar por mês?</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <p className="font-mono text-[10px] text-on-surface-dim mb-1">R$ por mês</p>
                    <input className="input qtm-num text-sm" type="text" inputMode="decimal" value={salario}
                      onChange={(e) => setSalario(e.target.value)} placeholder="2000" aria-label="Quanto quer ganhar por mês" />
                  </div>
                  <div className="w-28">
                    <p className="font-mono text-[10px] text-on-surface-dim mb-1">horas/mês</p>
                    <input className="input qtm-num text-sm" type="number" inputMode="numeric" value={horasMes}
                      onChange={(e) => setHorasMes(e.target.value)} placeholder="160" aria-label="Horas trabalhadas no mês" />
                  </div>
                </div>
                {vhCalculado > 0 && (
                  <>
                    <p className="text-sm text-on-surface">
                      → sua hora vale <strong className="qtm-num">{brl(vhCalculado)}</strong>
                    </p>
                    <button type="button" onClick={usarCalculado} className="btn-secondary">Usar esse valor</button>
                  </>
                )}
              </div>
            )}

            {ajuda === 'ia' && (
              <div className="border border-outline rounded-xl bg-surface-1 px-3 py-3 space-y-2">
                <p className="text-sm text-on-surface">O que você faz pra vender?</p>
                <input className="input text-sm" type="text" value={atividade}
                  onChange={(e) => { setAtividade(e.target.value); setSugErro('') }}
                  placeholder="Ex.: bolos e doces" aria-label="O que você faz pra vender" />
                {sugErro && <p className="text-sm text-danger">{sugErro}</p>}
                <button type="button" onClick={pedirSugestao} disabled={sugerindo} className="btn-secondary">
                  {sugerindo ? 'Pensando…' : 'Sugerir um valor'}
                </button>
                <p className="text-xs text-on-surface-dim">
                  É um valor aproximado de mercado — você pode ajustar antes de salvar.
                </p>
              </div>
            )}

            {vhMsg && <p className={`text-sm ${vhMsg.tipo === 'ok' ? 'text-positive' : 'text-danger'}`}>{vhMsg.texto}</p>}
            <button onClick={salvarValorHora} disabled={vhSalvando} className="btn-primary">
              {vhSalvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </section>

        {/* Alterar senha */}
        <section>
          <p className="label mb-2">Alterar senha</p>
          <form onSubmit={trocarSenha} className="card space-y-3">
            <FormField label="Senha atual">
              <input className="input" type="password" autoComplete="current-password"
                value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} required />
            </FormField>
            <FormField label="Nova senha (mín. 8)">
              <input className="input" type="password" autoComplete="new-password" minLength={8}
                value={senhaNova} onChange={(e) => setSenhaNova(e.target.value)} required />
            </FormField>
            <FormField label="Confirmar nova senha">
              <input className="input" type="password" autoComplete="new-password"
                value={senhaConf} onChange={(e) => setSenhaConf(e.target.value)} required />
            </FormField>
            {senhaMsg && <p className={`text-sm ${senhaMsg.tipo === 'ok' ? 'text-positive' : 'text-danger'}`}>{senhaMsg.texto}</p>}
            <button type="submit" disabled={senhaSalvando} className="btn-primary">
              {senhaSalvando ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>
        </section>

        {/* Assinatura */}
        <section>
          <p className="label mb-2">Assinatura</p>
          <Link to="/assinatura" className="card flex items-center justify-between active:bg-surface-1">
            <span className="text-sm text-on-surface">Gerenciar assinatura</span>
            <svg className="w-4 h-4 text-on-surface-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

        {/* Sessões */}
        <section>
          <p className="label mb-2">Sessões</p>
          <div className="space-y-2">
            <button onClick={logout} className="btn-secondary w-full">Sair deste dispositivo</button>
            <button onClick={() => setConfirmLogoutAll(true)}
              className="w-full font-sans font-semibold text-sm text-danger border border-danger rounded-full py-3 active:bg-danger-bg transition-colors">
              Sair de todos os dispositivos
            </button>
            <p className="text-xs text-on-surface-dim">
              Use "todos os dispositivos" se achar que alguém entrou na sua conta — desconecta tudo, inclusive este aparelho.
            </p>
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={confirmLogoutAll}
        onClose={() => setConfirmLogoutAll(false)}
        onConfirm={sairDeTudo}
        title="Sair de todos os dispositivos"
        message="Vai desconectar todos os aparelhos, inclusive este. Você vai precisar entrar de novo."
        confirmLabel="Sair de tudo"
      />
    </Layout>
  )
}
