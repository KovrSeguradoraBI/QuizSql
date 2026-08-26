import { memo, useEffect } from 'react'
import { SCORE_CONFIG } from '../lib/scoring'
import type { Difficulty, Question } from '../types'

const ROTULO_DIFICULDADE: Record<Difficulty, { texto: string; emoji: string; classe: string }> =
  {
    facil: { texto: 'Fácil', emoji: '🟢', classe: 'border-green-500/50 text-green-300' },
    medio: { texto: 'Médio', emoji: '🟡', classe: 'border-amber-500/50 text-amber-300' },
    dificil: { texto: 'Difícil', emoji: '🔴', classe: 'border-red-500/50 text-red-300' },
  }

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F']

interface Props {
  questao: Question
  selectedIndex: number | null
  mostrarFeedback: boolean
  hintUsed: boolean
  timedOut: boolean
  pontosGanhos: number
  ehUltima: boolean
  onResponder: (i: number) => void
  onUsarDica: () => void
  onProxima: () => void
}

/**
 * Memoizado de propósito: o timer da partida atualiza o estado a cada
 * 100ms, e sem isto o cartão inteiro re-renderiza 10x por segundo com
 * props idênticas. Todos os callbacks que chegam aqui são useCallback
 * estáveis, então a comparação rasa do memo funciona.
 */
function QuestionCard({
  questao,
  selectedIndex,
  mostrarFeedback,
  hintUsed,
  timedOut,
  pontosGanhos,
  ehUltima,
  onResponder,
  onUsarDica,
  onProxima,
}: Props) {
  const acertou = mostrarFeedback && selectedIndex === questao.correctIndex
  const rotulo = ROTULO_DIFICULDADE[questao.difficulty]
  const pontosBase = SCORE_CONFIG.basePoints[questao.difficulty]

  // Atalhos de teclado: 1..9 escolhe a alternativa, Enter avança.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (mostrarFeedback) {
        if (e.key === 'Enter' || e.key === ' ') {
          // Não sequestra o Enter de um botão já focado.
          if ((e.target as HTMLElement)?.tagName === 'BUTTON') return
          e.preventDefault()
          onProxima()
        }
        return
      }
      const n = Number(e.key)
      if (Number.isInteger(n) && n >= 1 && n <= questao.options.length) {
        onResponder(n - 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mostrarFeedback, questao.options.length, onResponder, onProxima])

  function classeAlternativa(i: number): string {
    const base =
      'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors sm:p-4'

    if (!mostrarFeedback) {
      return `${base} border-slate-700 bg-slate-900/50 hover:border-sky-500 hover:bg-sky-500/10 cursor-pointer`
    }
    if (i === questao.correctIndex) {
      return `${base} border-green-500 bg-green-500/15 anim-pulsar`
    }
    if (i === selectedIndex) {
      return `${base} border-red-500 bg-red-500/15 anim-tremer`
    }
    return `${base} border-slate-800 bg-slate-900/30 opacity-55`
  }

  return (
    <article className="anim-surgir rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-xl backdrop-blur sm:p-6">
      <header className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${rotulo.classe}`}
        >
          {rotulo.emoji} {rotulo.texto} · {pontosBase} pts
        </span>
        <span className="rounded-full border border-slate-700 px-2.5 py-0.5 text-xs text-slate-400">
          {questao.topic}
        </span>
      </header>

      <h2 className="mb-5 text-lg leading-snug font-semibold text-slate-50 sm:text-xl">
        {questao.question}
      </h2>

      <ul className="flex flex-col gap-2.5">
        {questao.options.map((opcao, i) => (
          <li key={i}>
            <button
              type="button"
              className={classeAlternativa(i)}
              onClick={() => onResponder(i)}
              disabled={mostrarFeedback}
              aria-pressed={selectedIndex === i}
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-md border border-slate-600 font-mono text-sm font-bold"
                aria-hidden="true"
              >
                {LETRAS[i] ?? i + 1}
              </span>
              <span className="min-w-0 break-words font-mono text-sm text-slate-100 sm:text-base">
                {opcao}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Dica: só antes de responder, e cobra metade dos pontos. */}
      {!mostrarFeedback && questao.hint && (
        <div className="mt-4">
          {hintUsed ? (
            <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
              💡 {questao.hint}
              <span className="mt-1 block text-xs text-amber-300/70">
                Esta pergunta agora vale metade dos pontos.
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={onUsarDica}
              className="cursor-pointer text-sm text-amber-300 underline decoration-dotted hover:text-amber-200"
            >
              💡 Ver dica (vale metade dos pontos)
            </button>
          )}
        </div>
      )}

      {mostrarFeedback && (
        <div className="anim-surgir mt-5 border-t border-slate-700 pt-4">
          <p
            className={`mb-2 flex flex-wrap items-center gap-2 font-bold ${
              acertou ? 'text-green-400' : 'text-red-400'
            }`}
            role="status"
          >
            {acertou ? (
              <>
                ✅ Correto!
                <span className="font-mono text-sky-300">
                  +{pontosGanhos} pontos
                </span>
              </>
            ) : timedOut ? (
              <>⏱️ Tempo esgotado — 0 pontos</>
            ) : (
              <>❌ Resposta errada — 0 pontos</>
            )}
          </p>

          <p className="mb-4 text-sm leading-relaxed text-slate-300">
            <strong className="text-slate-100">Explicação: </strong>
            {questao.explanation}
          </p>

          <button
            type="button"
            onClick={onProxima}
            autoFocus
            className="w-full cursor-pointer rounded-xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 transition-colors hover:bg-sky-400 sm:w-auto"
          >
            {ehUltima ? 'Ver resultado' : 'Próxima'} →
          </button>
        </div>
      )}
    </article>
  )
}

export default memo(QuestionCard)
