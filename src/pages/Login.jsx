import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { login, register as registerUser } from '../api/auth'
import useAuthStore from '../store/authStore'

export default function Login() {
  // ?modo=cadastro abre direto no formulário de criar conta (CTAs da landing page)
  const [searchParams] = useSearchParams()
  const [modo, setModo] = useState(
    searchParams.get('modo') === 'cadastro' ? 'registro' : 'login'
  ) // 'login' | 'registro'
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setToken } = useAuthStore()

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (dados) => {
    setErro('')
    setLoading(true)
    try {
      const fn = modo === 'login' ? login : registerUser
      const res = await fn(dados)
      setToken(res.data.access_token)
      navigate('/dashboard')
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-end sm:items-center justify-center">
      <div className="bg-bone w-full max-w-sm p-6 rounded-none">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink font-sans">Quantum</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-mute mt-1">Gestão para confeiteiros</p>
        </div>

        <div className="flex border border-ink mb-6">
          {['login', 'registro'].map((m) => (
            <button
              key={m}
              onClick={() => { setModo(m); setErro('') }}
              className={`flex-1 py-2 font-mono text-xs uppercase tracking-widest transition-colors
                ${modo === m ? 'bg-ink text-bone' : 'text-mute'}`}
            >
              {m === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {modo === 'registro' && (
            <div>
              <label className="label" htmlFor="login-nome">Nome completo</label>
              <input
                id="login-nome"
                className="input"
                placeholder="Sua confeitaria"
                autoComplete="name"
                {...register('nome', { required: 'Nome obrigatório' })}
              />
              {errors.nome && <p className="text-xs font-mono text-rust mt-1">{errors.nome.message}</p>}
            </div>
          )}

          <div>
            <label className="label" htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              {...register('email', { required: 'E-mail obrigatório' })}
            />
            {errors.email && <p className="text-xs font-mono text-rust mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="login-senha">Senha</label>
            <input
              id="login-senha"
              className="input"
              type="password"
              placeholder="••••••••"
              autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
              {...register('senha', { required: 'Senha obrigatória', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
            />
            {errors.senha && <p className="text-xs font-mono text-rust mt-1">{errors.senha.message}</p>}
          </div>

          {erro && (
            <div className="bg-rust/10 border border-rust px-4 py-3">
              <p className="text-sm font-mono text-rust">{erro}</p>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  )
}
