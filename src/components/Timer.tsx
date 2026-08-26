interface Props {
  restanteSec: number
  totalSec: number
  /** Congelado após a resposta: o tempo pára durante o feedback. */
  pausado: boolean
}

export default function Timer({ restanteSec, totalSec, pausado }: Props) {
  const fracao = totalSec > 0 ? Math.max(restanteSec, 0) / totalSec : 0
  const segundos = Math.ceil(Math.max(restanteSec, 0))
  const critico = !pausado && fracao <= 0.25

  const cor = critico
    ? 'bg-red-500'
    : fracao <= 0.5
      ? 'bg-amber-400'
      : 'bg-sky-400'

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="text-slate-400">Tempo</span>
        <span
          className={`font-mono font-semibold tabular-nums ${
            critico ? 'text-red-400' : 'text-slate-200'
          }`}
          // O contador muda rápido; anunciar cada segundo atrapalharia
          // leitores de tela, então só o valor fica acessível.
          aria-label={`${segundos} segundos restantes`}
        >
          {segundos}s
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-700/60"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={Math.round(totalSec)}
        aria-valuenow={segundos}
        aria-label="Tempo restante da pergunta"
      >
        <div
          className={`h-full rounded-full ${cor} transition-[width] duration-100 ease-linear`}
          style={{ width: `${fracao * 100}%` }}
        />
      </div>
    </div>
  )
}
