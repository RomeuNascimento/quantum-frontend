import { Component } from 'react'

// Exceção de render sem boundary = tela branca sem saída. Aqui o usuário
// ganha uma tela de erro no design system com botão de recuperação.
export default class ErrorBoundary extends Component {
  state = { erro: null }

  static getDerivedStateFromError(erro) {
    return { erro }
  }

  componentDidCatch(erro, info) {
    console.error('ErrorBoundary:', erro, info)
  }

  render() {
    if (!this.state.erro) return this.props.children
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
        <div className="card max-w-sm w-full flex flex-col items-center text-center gap-4">
          <p className="font-mono text-xs uppercase tracking-widest text-on-surface-dim">Algo deu errado</p>
          <h2 className="font-serif text-xl text-on-surface">Ops, encontramos um erro</h2>
          <p className="text-sm text-on-surface-dim">
            A tela encontrou um erro inesperado. Seus dados estão salvos no servidor.
          </p>
          <button
            onClick={() => { this.setState({ erro: null }); window.location.href = '/dashboard' }}
            className="btn-primary px-6"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    )
  }
}
