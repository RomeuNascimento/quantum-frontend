import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { login, register as registerUser } from '../api/auth'
import useAuthStore from '../store/authStore'

export default function Login() {
  const [modo, setModo] = useState('login') // 'login' | 'registro'
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
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-700 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Quantum</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão para confeiteiros</p>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {['login', 'registro'].map((m) => (
            <button
              key={m}
              onClick={() => { setModo(m); setErro('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all
                ${modo === m ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}
            >
              {m === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {modo === 'registro' && (
            <div>
              <label className="label">Nome completo</label>
              <input
                className="input"
                placeholder="Sua confeitaria"
                {...register('nome', { required: 'Nome obrigatório' })}
              />
              {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome.message}</p>}
            </div>
          )}

          <div>
            <label className="label">E-mail</label>
            <input
              className="input"
              type="email"
              placeholder="seu@email.com"
              {...register('email', { required: 'E-mail obrigatório' })}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Senha</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              {...register('senha', { required: 'Senha obrigatória', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
            />
            {errors.senha && <p className="text-xs text-red-600 mt-1">{errors.senha.message}</p>}
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-700">{erro}</p>
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
