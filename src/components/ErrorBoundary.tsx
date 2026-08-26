import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  error: Error | null
}

/**
 * Rede de segurança de render. Sem isto, um erro em qualquer componente
 * desmonta a árvore inteira e o jogador vê uma tela branca — o oposto da
 * degradação graciosa que o resto do app persegue (RNF04).
 *
 * Precisa ser classe: não existe equivalente em hooks para
 * getDerivedStateFromError / componentDidCatch.
 */
export default class ErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[quiz] erro de render:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-center">
          <h1 className="mb-2 text-lg font-bold text-red-300">
            Algo deu errado
          </h1>
          <p className="mb-1 text-sm text-slate-300">
            A partida foi interrompida por um erro inesperado.
          </p>
          <p className="mb-5 font-mono text-xs break-words text-slate-500">
            {error.message}
          </p>
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            {/* Limpar o erro remonta os filhos: resolve falhas transitórias
                sem custar o progresso guardado no localStorage. */}
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="cursor-pointer rounded-xl bg-sky-500 px-4 py-2.5 font-semibold text-slate-950 hover:bg-sky-400"
            >
              Tentar novamente
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="cursor-pointer rounded-xl border border-slate-600 px-4 py-2.5 font-semibold text-slate-200 hover:bg-slate-800"
            >
              Recarregar a página
            </button>
          </div>
        </div>
      </div>
    )
  }
}
