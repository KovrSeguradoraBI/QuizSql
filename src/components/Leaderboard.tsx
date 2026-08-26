import { useCallback, useEffect, useState } from 'react'
import { getLeaderboard } from '../lib/api'
import { badgeById } from '../lib/badges'
import type { LeaderboardEntry } from '../types'

interface Props {
  /** Apelido do jogador atual, para destacar a própria linha. */
  nickname: string
  onVoltar: () => void
}

const MEDALHAS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ nickname, onVoltar }: Props) {
  const [entradas, setEntradas] = useState<LeaderboardEntry[] | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(() => {
    setCarregando(true)
    setErro(null)
    getLeaderboard(20).then((r) => {
      setEntradas(r.data)
      setErro(r.error)
      setCarregando(false)
    })
  }, [])

  useEffect(carregar, [carregar])

  return (
    <div className="anim-surgir flex flex-col gap-4">
      <header className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-50">🏅 Ranking global</h1>
        <p className="mt-1 text-sm text-slate-400">
          Melhores partidas, por pontuação.
        </p>
      </header>

      {carregando && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-xl border border-slate-700 bg-slate-900/40"
            />
          ))}
        </div>
      )}

      {!carregando && erro && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center">
          <p className="mb-3 text-sm text-slate-300">{erro}</p>
          <button
            type="button"
            onClick={carregar}
            className="cursor-pointer rounded-lg bg-sky-500 px-3.5 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!carregando && !erro && entradas?.length === 0 && (
        <p className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 text-center text-slate-400">
          Ninguém jogou ainda. Seja o primeiro do ranking!
        </p>
      )}

      {!carregando && entradas && entradas.length > 0 && (
        <ol className="flex flex-col gap-2">
          {entradas.map((e, i) => {
            const euMesmo = e.playerName === nickname
            return (
              <li
                key={e.id}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  euMesmo
                    ? 'border-sky-500/60 bg-sky-500/10'
                    : 'border-slate-700 bg-slate-900/50'
                }`}
              >
                <span className="w-8 shrink-0 text-center font-mono font-bold text-slate-400">
                  {MEDALHAS[i] ?? i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-100">
                    {e.playerName}
                    {euMesmo && (
                      <span className="ml-1.5 text-xs font-normal text-sky-300">
                        (você)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    {e.correct}/{e.total} acertos
                    {e.badges.length > 0 && (
                      <span className="ml-1.5" aria-label="conquistas">
                        {e.badges
                          .map((id) => badgeById(id)?.emoji)
                          .filter(Boolean)
                          .join(' ')}
                      </span>
                    )}
                  </p>
                </div>
                <span className="font-mono text-lg font-bold text-sky-300 tabular-nums">
                  {e.score}
                </span>
              </li>
            )
          })}
        </ol>
      )}

      <button
        type="button"
        onClick={onVoltar}
        className="mx-auto cursor-pointer rounded-xl border border-slate-600 px-5 py-2.5 font-semibold text-slate-200 hover:bg-slate-800"
      >
        ← Voltar
      </button>
    </div>
  )
}
