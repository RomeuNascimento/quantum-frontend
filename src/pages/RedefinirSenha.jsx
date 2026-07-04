import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api/client'
import useAuthStore from '../store/authStore'

// Recuperação de senha — passo 2: criar a senha nova (link do e-mail).
// O backend devolve uma sessão nova → a pessoa já entra logada, sem redigitar.
export default function RedefinirSenha() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { setToken } = useAuthStore()

  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async (dados) => {
    setErro('')
    setLoading(true)
    try {
      const r = await api.post('/auth/redefinir-senha', {
        token,
        nova_senha: dados.nova_senha,
      })
      // já sai logado — sem pedir pra digitar tudo de novo
      setToken(r.data.access_token)
      navigate('/assistente', { replace: true })
    } catch (e) {
      setErro(e.message)
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="bg-bone w-full max-w-sm p-6">
          <div className="border border-rust bg-rust/10 px-4 py-3 mb-6">
            <p className="text-sm font-sans text-rust">
              Este link não está completo. Peça um novo, é rapidinho.
            </p>
          </div>
          <Link to="/esqueci-senha" className="btn-primary block text-center">
            Pedir um link novo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink flex items-end sm:items-center justify-center">
      <div className="bg-bone w-full max-w-sm p-6 rounded-none">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink font-sans">Quantum</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-mute mt-1">
            Criar senha nova
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label" htmlFor="nova-senha">Senha nova</label>
            <input
              id="nova-senha"
              className="input"
              type="password"
              placeholder="pelo menos 8 letras ou números"
              autoComplete="new-password"
              {...register('nova_senha', {
                required: 'Escreva a senha nova',
                minLength: { value: 8, message: 'Use pelo menos 8 letras ou números' },
              })}
            />
            {errors.nova_senha && <p className="text-xs font-sans text-rust mt-1">{errors.nova_senha.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="confirma-senha">Escreva de novo, igual</label>
            <input
              id="confirma-senha"
              className="input"
              type="password"
              placeholder="a mesma senha"
              autoComplete="new-password"
              {...register('confirma', {
                validate: (v) => v === watch('nova_senha') || 'As duas senhas não estão iguais',
              })}
            />
            {errors.confirma && <p className="text-xs font-sans text-rust mt-1">{errors.confirma.message}</p>}
          </div>

          {erro && (
            <div className="bg-rust/10 border border-rust px-4 py-3">
              <p className="text-sm font-sans text-rust">{erro}</p>
              <Link to="/esqueci-senha" className="text-sm font-sans text-rust underline">
                Pedir um link novo
              </Link>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar e entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
