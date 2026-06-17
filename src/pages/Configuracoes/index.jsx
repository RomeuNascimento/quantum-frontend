import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import FormField from '../../components/FormField'
import ConfirmDialog from '../../components/ConfirmDialog'
import useAuthStore from '../../store/authStore'
import { getMe, getConfiguracao, updateConfiguracao, alterarSenha, logoutAll } from '../../api/auth'
import CalculadoraValorHora from '../../components/CalculadoraValorHora'

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

  const salvarValorHora = async () => {
    const raw = String(valorHora).trim()
    const v = raw === '' ? 0 : parseFloat(raw.replace(',', '.'))
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

  const usarValorCalculado = (valor) => {
    setValorHora(valor.toFixed(2))
    setVhMsg(null)
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
            <p className="text-sm text-ink font-semibold">{conta?.nome || '—'}</p>
            <p className="text-sm text-mute break-all">{conta?.email || '—'}</p>
          </div>
        </section>

        {/* Mão de obra */}
        <section>
          <p className="label mb-2">Mão de obra</p>
          <div className="card space-y-2">
            <label htmlFor="vh" className="text-sm text-ink block">Valor da sua hora de trabalho (R$)</label>
            <input id="vh" className="input qtm-num" inputMode="decimal" value={valorHora}
              onChange={(e) => { setValorHora(e.target.value); setVhMsg(null) }} placeholder="Ex.: 20" />
            <p className="text-xs text-mute">
              Usado pra calcular o custo de mão de obra nas receitas e produtos.
            </p>

            {/* Calculadora: valor-hora a partir do salário + carga horária */}
            <CalculadoraValorHora storageKey="quantum_vh_calc" onUsar={usarValorCalculado} />

            {vhMsg && <p className={`text-sm ${vhMsg.tipo === 'ok' ? 'text-ink' : 'text-rust'}`}>{vhMsg.texto}</p>}
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
            {senhaMsg && <p className={`text-sm ${senhaMsg.tipo === 'ok' ? 'text-ink' : 'text-rust'}`}>{senhaMsg.texto}</p>}
            <button type="submit" disabled={senhaSalvando} className="btn-primary">
              {senhaSalvando ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>
        </section>

        {/* Assinatura */}
        <section>
          <p className="label mb-2">Assinatura</p>
          <Link to="/assinatura" className="card flex items-center justify-between active:bg-line/40">
            <span className="text-sm text-ink">Gerenciar assinatura</span>
            <svg className="w-4 h-4 text-mute" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              strokeWidth={1.75} strokeLinecap="square" strokeLinejoin="miter">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

        {/* Sessões */}
        <section>
          <p className="label mb-2">Sessões</p>
          <div className="space-y-2">
            <button onClick={logout} className="btn-ghost w-full">Sair deste dispositivo</button>
            <button onClick={() => setConfirmLogoutAll(true)}
              className="w-full font-mono text-xs uppercase tracking-widest text-rust border border-rust py-2.5 active:bg-rust active:text-bone">
              Sair de todos os dispositivos
            </button>
            <p className="text-xs text-mute">
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
