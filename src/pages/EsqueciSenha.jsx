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
    <div className="min-h-screen bg-ink flex items-end sm:items-center justify-center">
      <div className="bg-bone w-full max-w-sm p-6 rounded-none">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink font-sans">Quantum</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-mute mt-1">
            Esqueci minha senha
          </p>
        </div>

        {enviado ? (
          <div>
            <div className="border border-ink bg-receipt px-4 py-3 mb-6">
              <p className="text-sm text-ink">
                Pronto! Se este e-mail tiver conta, você vai receber uma mensagem
                com o botão <strong>Criar senha nova</strong>.
              </p>
              <p className="text-sm text-ink mt-2">
                Não achou? Olhe na caixa de <strong>spam</strong>.
              </p>
            </div>
            <Link to="/login" className="btn-primary block text-center">
              Voltar para entrar
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-sm text-mute mb-2">
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
              {errors.email && <p className="text-xs font-sans text-rust mt-1">{errors.email.message}</p>}
            </div>

            {erro && (
              <div className="bg-rust/10 border border-rust px-4 py-3">
                <p className="text-sm font-sans text-rust">{erro}</p>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Me manda o link'}
            </button>

            <Link to="/login" className="block text-center text-sm font-sans text-mute underline mt-4">
              Voltar para entrar
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
