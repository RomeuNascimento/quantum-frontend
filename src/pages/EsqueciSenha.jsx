import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api/client'

// Recuperação de senha — passo 1: pedir o link por e-mail.
// Linguagem simples e resposta única (não revela se o e-mail existe).
export default function EsqueciSenha() {
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (dados) => {
    setErro('')
    setLoading(true)
    try {
      await api.post('/auth/esqueci-senha', { email: dados.email })
      setEnviado(true)
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
          <p className="eyebrow mt-2">
            Esqueci minha senha
          </p>
        </div>

        {enviado ? (
          <div>
            <div className="bg-positive-bg text-positive rounded-xl px-4 py-3 mb-6">
              <p className="text-sm">
                Pronto! Se este e-mail tiver conta, você vai receber uma mensagem
                com o botão <strong>Criar senha nova</strong>.
              </p>
              <p className="text-sm mt-2">
                Não achou? Olhe na caixa de <strong>spam</strong>.
              </p>
            </div>
            <Link to="/login" className="btn-primary block text-center">
              Voltar para entrar
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-sm text-on-surface-dim mb-2">
              Sem problema! Escreva seu e-mail que a gente manda um link
              pra você criar uma senha nova.
            </p>

            <div>
              <label className="label" htmlFor="esqueci-email">E-mail</label>
              <input
                id="esqueci-email"
                className="input"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                {...register('email', { required: 'Escreva seu e-mail' })}
              />
              {errors.email && <p className="text-sm font-sans text-danger mt-1">{errors.email.message}</p>}
            </div>

            {erro && (
              <div className="bg-danger-bg text-on-danger-bg rounded-xl px-4 py-3">
                <p className="text-sm font-sans">{erro}</p>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Me manda o link'}
            </button>

            <Link to="/login" className="block text-center text-sm font-sans text-primary mt-4">
              Voltar para entrar
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
