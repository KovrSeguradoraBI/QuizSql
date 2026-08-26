import { BADGES } from '../lib/badges'

interface Props {
  /** Ids conquistados. As demais aparecem bloqueadas. */
  conquistadas: string[]
  /** Só as conquistadas, sem as bloqueadas. */
  somenteConquistadas?: boolean
}

export default function BadgeList({
  conquistadas,
  somenteConquistadas = false,
}: Props) {
  const lista = somenteConquistadas
    ? BADGES.filter((b) => conquistadas.includes(b.id))
    : BADGES

  if (lista.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        Nenhuma conquista nesta partida. Tente uma partida sem erros!
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {lista.map((badge) => {
        const ganha = conquistadas.includes(badge.id)
        return (
          <li
            key={badge.id}
            className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
              ganha
                ? 'border-amber-500/50 bg-amber-500/10'
                : 'border-slate-700 bg-slate-900/40 opacity-55'
            }`}
          >
            <span
              className={`text-2xl ${ganha ? '' : 'grayscale'}`}
              aria-hidden="true"
            >
              {badge.emoji}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-slate-100">
                {badge.name}
                <span className="sr-only">
                  {ganha ? ' (conquistada)' : ' (bloqueada)'}
                </span>
              </p>
              <p className="text-sm text-slate-400">{badge.description}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
