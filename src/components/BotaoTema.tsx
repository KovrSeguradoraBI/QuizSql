import { useTema } from '../hooks/useTema'

/**
 * Alterna entre os dois temas escuros.
 *
 * O rótulo mostra o tema de DESTINO, não o atual: num botão de alternar,
 * dizer para onde se vai é menos ambíguo do que dizer onde se está.
 */
export default function BotaoTema() {
  const { atual, proximo, alternar } = useTema()
  const rotulo = `Mudar para o tema ${proximo.nome}`

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={rotulo}
      title={rotulo}
      className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
    >
      <span aria-hidden="true">{proximo.emoji}</span>
      <span className="hidden sm:inline">{proximo.nome}</span>
      {/* Anuncia a troca a quem usa leitor de tela, já que a mudança é visual. */}
      <span className="sr-only" role="status">
        Tema atual: {atual.nome}
      </span>
    </button>
  )
}
