import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
    <div className="min-h-screen bg-surface flex items-end sm:items-center justify-center p-4">
      <div className="card w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="title-serif text-4xl">Quantum</h1>
          <p className="eyebrow mt-2">Gestão para confeiteiros</p>
        </div>

        <div className="flex gap-1 p-1 bg-surface-2 rounded-full mb-6">
          {['login', 'registro'].map((m) => (
            <button
              key={m}
              onClick={() => { setModo(m); setErro('') }}
              className={`flex-1 py-2 font-sans font-semibold text-sm rounded-full transition-colors
                ${modo === m ? 'bg-primary text-on-primary' : 'text-on-surface-dim'}`}
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
                placeholder="Maria da Silva"
                autoComplete="name"
                {...register('nome', { required: 'Escreva seu nome' })}
              />
              {errors.nome && <p className="text-sm text-danger mt-1">{errors.nome.message}</p>}
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
              {...register('email', { required: 'Escreva seu e-mail' })}
            />
            {errors.email && <p className="text-sm text-danger mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="login-senha">Senha</label>
            <input
              id="login-senha"
              className="input"
              type="password"
              placeholder="••••••••"
              autoComplete={modo === 'registro' ? 'new-password' : 'current-password'}
              {...register('senha', { required: 'Escreva sua senha', minLength: { value: 8, message: 'Use pelo menos 8 letras ou números' } })}
            />
            {errors.senha && <p className="text-sm text-danger mt-1">{errors.senha.message}</p>}
            {modo === 'login' && (
              <Link to="/esqueci-senha" className="inline-block text-sm font-sans text-primary mt-2">
                Esqueci minha senha
              </Link>
            )}
          </div>

          {erro && (
            <div className="bg-danger-bg text-on-danger-bg rounded-xl px-4 py-3">
              <p className="text-sm font-sans">{erro}</p>
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
