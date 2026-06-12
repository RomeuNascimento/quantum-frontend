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
      <div className="min-h-screen bg-bone flex flex-col items-center justify-center px-6 gap-4">
        <p className="font-mono text-xs uppercase tracking-widest text-mute">Algo deu errado</p>
        <p className="text-sm text-ink text-center">
          A tela encontrou um erro inesperado. Seus dados estão salvos no servidor.
        </p>
        <button
          onClick={() => { this.setState({ erro: null }); window.location.href = '/dashboard' }}
          className="btn-primary px-6"
        >
          Voltar ao início
        </button>
      </div>
    )
  }
}
