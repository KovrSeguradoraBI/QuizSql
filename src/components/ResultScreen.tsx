import BadgeList from './BadgeList'
import { faixaPorXp, proximaFaixa } from '../lib/scoring'
import type { GameResult, PlayerProfile } from '../types'

interface Props {
  resultado: GameResult
  perfil: PlayerProfile | null
  salvando: boolean
  erroSalvar: string | null
  onJogarNovamente: () => void
  onRanking: () => void
  onInicio: () => void
}

function formatarTempo(segundos: number): string {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function mensagem(aproveitamento: number): string {
  if (aproveitamento === 1) return 'Impecável! Gabaritou a partida. 🎉'
  if (aproveitamento >= 0.8) return 'Muito bom! Você domina o básico.'
  if (aproveitamento >= 0.5) return 'Bom caminho — revise os erros e tente de novo.'
  return 'Todo DBA começou aqui. Releia as explicações e jogue outra!'
}

export default function ResultScreen({
  resultado,
  perfil,
  salvando,
  erroSalvar,
  onJogarNovamente,
  onRanking,
  onInicio,
}: Props) {
  const aproveitamento =
    resultado.total > 0 ? resultado.correct / resultado.total : 0

  // Enquanto o perfil não voltar do Supabase, mostra a faixa que a XP desta
  // partida já garante, para a tela nunca ficar vazia.
  const faixa = perfil?.faixa ?? faixaPorXp(resultado.xpEarned)
  const proxima = perfil ? proximaFaixa(perfil.totalXp) : null

  return (
    <div className="anim-surgir flex flex-col gap-5">
      <header className="text-center">
        <p className="text-sm font-medium tracking-wide text-slate-400 uppercase">
          Partida encerrada
        </p>
        <p className="my-1 font-mono text-5xl font-extrabold text-sky-300">
          {resultado.score}
        </p>
        <p className="text-slate-400">pontos</p>
        <p className="mt-3 text-slate-300">{mensagem(aproveitamento)}</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-center">
          <p className="font-mono text-2xl font-bold text-green-400">
            {resultado.correct}/{resultado.total}
          </p>
          <p className="text-xs text-slate-400">acertos</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-center">
          <p className="font-mono text-2xl font-bold text-slate-100">
            {Math.round(aproveitamento * 100)}%
          </p>
          <p className="text-xs text-slate-400">aproveitamento</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-center">
          <p className="font-mono text-2xl font-bold text-slate-100">
            {formatarTempo(resultado.timeSpentSec)}
          </p>
          <p className="text-xs text-slate-400">tempo total</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-3 text-center">
          <p className="font-mono text-2xl font-bold text-indigo-300">
            +{resultado.xpEarned}
          </p>
          <p className="text-xs text-slate-400">XP ganha</p>
        </div>
      </section>

      <section className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-4 text-center">
        <p className="text-sm text-slate-300">
          Faixa atual: <strong className="text-indigo-200">{faixa}</strong>
          {perfil && (
            <>
              {' '}
              · <span className="font-mono">{perfil.totalXp} XP</span> no total
            </>
          )}
        </p>
        {proxima && (
          <p className="mt-1 text-xs text-slate-400">
            Faltam <span className="font-mono">{proxima.faltam} XP</span> para{' '}
            {proxima.faixa}.
          </p>
        )}
        {salvando && (
          <p className="mt-2 text-xs text-slate-400" role="status">
            Salvando no Supabase…
          </p>
        )}
        {erroSalvar && (
          <p className="mt-2 text-xs text-amber-300" role="status">
            ⚠️ {erroSalvar}
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-semibold text-slate-200">
          Conquistas desta partida
        </h2>
        <BadgeList conquistadas={resultado.badges} somenteConquistadas />
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onJogarNovamente}
          className="flex-1 cursor-pointer rounded-xl bg-sky-500 px-4 py-3 font-bold text-slate-950 transition-colors hover:bg-sky-400"
        >
          🔄 Jogar novamente
        </button>
        <button
          type="button"
          onClick={onRanking}
          className="cursor-pointer rounded-xl border border-slate-600 px-4 py-3 font-semibold text-slate-200 transition-colors hover:bg-slate-800"
        >
          🏅 Ranking
        </button>
        <button
          type="button"
          onClick={onInicio}
          className="cursor-pointer rounded-xl border border-slate-600 px-4 py-3 font-semibold text-slate-200 transition-colors hover:bg-slate-800"
        >
          Início
        </button>
      </div>
    </div>
  )
}
