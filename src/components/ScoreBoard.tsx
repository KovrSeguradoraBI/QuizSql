import { multiplicadorPorStreak } from '../lib/scoring'

interface Props {
  score: number
  streak: number
}

export default function ScoreBoard({ score, streak }: Props) {
  const mult = multiplicadorPorStreak(streak)
  const temCombo = mult > 1

  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5">
        <span className="text-xs text-slate-400">Pontos </span>
        <span
          className="font-mono text-lg font-bold tabular-nums text-sky-300"
          aria-live="polite"
        >
          {score}
        </span>
      </div>

      <div
        className={`rounded-lg border px-3 py-1.5 transition-colors ${
          temCombo
            ? 'border-amber-500/60 bg-amber-500/10'
            : 'border-slate-700 bg-slate-900/60'
        }`}
        title={
          temCombo
            ? `Combo ativo: multiplicador x${mult}`
            : 'Acerte 3 seguidas para ativar o combo'
        }
      >
        <span className="text-xs text-slate-400">Streak </span>
        <span className="font-mono text-lg font-bold tabular-nums">
          {streak > 0 ? '🔥' : ''}
          {streak}
        </span>
        {temCombo && (
          <span className="ml-1 text-sm font-semibold text-amber-300">
            x{mult}
          </span>
        )}
      </div>
    </div>
  )
}
