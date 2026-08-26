import { useState } from 'react'
import BadgeList from './BadgeList'
import { SCORE_CONFIG, proximaFaixa } from '../lib/scoring'
import type { Difficulty, MatchConfig, PlayerProfile } from '../types'

const DIFICULDADES: { valor: Difficulty | null; texto: string }[] = [
  { valor: null, texto: 'Todas' },
  { valor: 'facil', texto: '🟢 Fácil' },
  { valor: 'medio', texto: '🟡 Médio' },
  { valor: 'dificil', texto: '🔴 Difícil' },
]

const QUANTIDADES = [5, 10, 15, 20]

interface Props {
  nickname: string
  onNicknameChange: (v: string) => void
  config: MatchConfig
  onConfigChange: (c: MatchConfig) => void
  perfil: PlayerProfile | null
  carregandoPerfil: boolean
  onJogar: () => void
  onRanking: () => void
}

export default function StartScreen({
  nickname,
  onNicknameChange,
  config,
  onConfigChange,
  perfil,
  carregandoPerfil,
  onJogar,
  onRanking,
}: Props) {
  const [erroApelido, setErroApelido] = useState<string | null>(null)

  function jogar() {
    if (nickname.trim().length < 2) {
      setErroApelido('Informe um apelido com pelo menos 2 caracteres.')
      return
    }
    setErroApelido(null)
    onJogar()
  }

  const proxima = perfil ? proximaFaixa(perfil.totalXp) : null

  return (
    <div className="anim-surgir flex flex-col gap-5">
      <header className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-50 sm:text-4xl">
          Quiz <span className="text-sky-400">SQL Server</span>
        </h1>
        <p className="mt-2 text-slate-400">
          Fundamentos de consultas, do <code className="text-sky-300">SELECT</code> ao{' '}
          <code className="text-sky-300">HAVING</code>. Responda rápido, mantenha o
          combo e suba de faixa.
        </p>
      </header>

      {/* Perfil / XP */}
      {carregandoPerfil ? (
        <div className="h-16 animate-pulse rounded-xl border border-slate-700 bg-slate-900/40" />
      ) : (
        perfil && (
          <section className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-slate-100">
                Bem-vindo de volta, {perfil.nickname}!
              </p>
              <p className="text-sm text-indigo-200">
                {perfil.faixa} ·{' '}
                <span className="font-mono">{perfil.totalXp} XP</span>
              </p>
            </div>
            {proxima && (
              <p className="mt-1 text-xs text-slate-400">
                Faltam <span className="font-mono">{proxima.faltam} XP</span> para{' '}
                {proxima.faixa}.
              </p>
            )}
          </section>
        )
      )}

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-xl backdrop-blur sm:p-6">
        <div>
          <label
            htmlFor="apelido"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Seu apelido no ranking
          </label>
          <input
            id="apelido"
            type="text"
            value={nickname}
            maxLength={24}
            onChange={(e) => onNicknameChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && jogar()}
            placeholder="Ex.: thiago.r"
            aria-invalid={erroApelido !== null}
            aria-describedby={erroApelido ? 'erro-apelido' : undefined}
            className="w-full rounded-xl border border-slate-600 bg-slate-950/60 px-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
          />
          {erroApelido && (
            <p id="erro-apelido" className="mt-1.5 text-sm text-red-400">
              {erroApelido}
            </p>
          )}
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-300">
            Dificuldade
          </legend>
          <div className="flex flex-wrap gap-2">
            {DIFICULDADES.map((d) => {
              const ativo = config.difficulty === d.valor
              return (
                <button
                  key={d.texto}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => onConfigChange({ ...config, difficulty: d.valor })}
                  className={`cursor-pointer rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
                    ativo
                      ? 'border-sky-500 bg-sky-500/20 text-sky-200'
                      : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {d.texto}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-300">
            Quantidade de perguntas
          </legend>
          <div className="flex flex-wrap gap-2">
            {QUANTIDADES.map((n) => {
              const ativo = config.questionCount === n
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => onConfigChange({ ...config, questionCount: n })}
                  className={`w-14 cursor-pointer rounded-xl border py-2 font-mono text-sm font-semibold transition-colors ${
                    ativo
                      ? 'border-sky-500 bg-sky-500/20 text-sky-200'
                      : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {n}
                </button>
              )
            })}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Se houver menos perguntas do que o escolhido, a partida usa todas as
            disponíveis.
          </p>
        </fieldset>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={jogar}
            className="flex-1 cursor-pointer rounded-xl bg-sky-500 px-4 py-3 text-lg font-bold text-slate-950 transition-colors hover:bg-sky-400"
          >
            ▶ Jogar
          </button>
          <button
            type="button"
            onClick={onRanking}
            className="cursor-pointer rounded-xl border border-slate-600 px-4 py-3 font-semibold text-slate-200 transition-colors hover:bg-slate-800"
          >
            🏅 Ranking
          </button>
        </div>
      </section>

      <details className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
        <summary className="cursor-pointer font-semibold text-slate-200">
          Como funciona a pontuação
        </summary>
        <div className="mt-3 flex flex-col gap-3 text-sm text-slate-300">
          <p>
            Cada pergunta vale{' '}
            <strong className="text-green-300">
              {SCORE_CONFIG.basePoints.facil} pts
            </strong>{' '}
            (fácil),{' '}
            <strong className="text-amber-300">
              {SCORE_CONFIG.basePoints.medio} pts
            </strong>{' '}
            (média) ou{' '}
            <strong className="text-red-300">
              {SCORE_CONFIG.basePoints.dificil} pts
            </strong>{' '}
            (difícil).
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Bônus de tempo:</strong> quanto mais rápido, mais pontos — até{' '}
              +50% do valor base.
            </li>
            <li>
              <strong>Combo:</strong> 3 acertos seguidos multiplicam por 1.2; 5 por
              1.5; 8 ou mais por 2.0. Um erro zera o combo.
            </li>
            <li>
              <strong>Dica:</strong> ajuda, mas corta os pontos da pergunta pela
              metade.
            </li>
            <li>
              <strong>Tempo esgotado</strong> conta como erro:{' '}
              {SCORE_CONFIG.timePerQuestionSec}s por pergunta.
            </li>
          </ul>
          <p className="text-slate-400">
            Dica de teclado: use as teclas <kbd>1</kbd>–<kbd>4</kbd> para responder e{' '}
            <kbd>Enter</kbd> para avançar.
          </p>
          <div>
            <p className="mb-2 font-semibold text-slate-200">Conquistas</p>
            <BadgeList conquistadas={perfil?.badges ?? []} />
          </div>
        </div>
      </details>
    </div>
  )
}
