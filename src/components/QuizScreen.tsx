import QuestionCard from './QuestionCard'
import ScoreBoard from './ScoreBoard'
import Timer from './Timer'
import type { UseQuizReturn } from '../hooks/useQuiz'

interface Props {
  quiz: UseQuizReturn
  onSair: () => void
}

export default function QuizScreen({ quiz, onSair }: Props) {
  if (quiz.phase === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div
          className="size-10 animate-spin rounded-full border-4 border-slate-700 border-t-sky-400"
          role="status"
          aria-label="Carregando perguntas"
        />
        <p className="text-slate-400">Carregando perguntas do Supabase…</p>
      </div>
    )
  }

  if (quiz.phase === 'error') {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-center">
        <h2 className="mb-2 text-lg font-bold text-red-300">
          Não foi possível iniciar a partida
        </h2>
        <p className="mb-5 text-sm text-slate-300">{quiz.error}</p>
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <button
            type="button"
            onClick={quiz.recarregar}
            className="cursor-pointer rounded-xl bg-sky-500 px-4 py-2.5 font-semibold text-slate-950 hover:bg-sky-400"
          >
            Tentar novamente
          </button>
          <button
            type="button"
            onClick={onSair}
            className="cursor-pointer rounded-xl border border-slate-600 px-4 py-2.5 font-semibold text-slate-200 hover:bg-slate-800"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    )
  }

  if (!quiz.questao) return null

  const progresso = quiz.total > 0 ? ((quiz.index + 1) / quiz.total) * 100 : 0

  return (
    <div className="flex flex-col gap-4">
      {quiz.fromCache && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          ⚠️ Sem conexão com o Supabase — jogando com as perguntas salvas no
          dispositivo. O resultado será enviado depois.
        </p>
      )}

      {/* Progresso da partida (RF11) */}
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-400">
            Pergunta {quiz.index + 1} de {quiz.total}
          </span>
          <ScoreBoard score={quiz.score} streak={quiz.streak} />
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={quiz.total}
          aria-valuenow={quiz.index + 1}
          aria-label="Progresso da partida"
        >
          <div
            className="h-full rounded-full bg-linear-to-r from-sky-500 to-indigo-400 transition-[width] duration-300"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      <Timer
        restanteSec={quiz.timeLeftSec}
        totalSec={quiz.timeTotalSec}
        pausado={quiz.phase === 'feedback'}
      />

      <QuestionCard
        // A key remonta o cartão a cada pergunta: reinicia as animações e
        // evita que o estado visual de uma vaze para a seguinte.
        key={quiz.questao.id}
        questao={quiz.questao}
        selectedIndex={quiz.selectedIndex}
        mostrarFeedback={quiz.phase === 'feedback'}
        hintUsed={quiz.hintUsed}
        timedOut={quiz.lastTimedOut}
        pontosGanhos={quiz.lastPoints}
        ehUltima={quiz.index + 1 >= quiz.total}
        onResponder={quiz.responder}
        onUsarDica={quiz.usarDica}
        onProxima={quiz.proxima}
      />

      <button
        type="button"
        onClick={onSair}
        className="mx-auto cursor-pointer text-sm text-slate-500 underline hover:text-slate-300"
      >
        Abandonar partida
      </button>
    </div>
  )
}
