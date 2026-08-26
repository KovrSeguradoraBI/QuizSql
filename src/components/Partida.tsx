import { useEffect } from 'react'
import QuizScreen from './QuizScreen'
import ResultScreen from './ResultScreen'
import { useQuiz } from '../hooks/useQuiz'
import type { MatchConfig, PlayerProfile } from '../types'

interface Props {
  config: MatchConfig
  nickname: string
  onSair: () => void
  onJogarNovamente: () => void
  onRanking: () => void
  /** Propaga o perfil atualizado para o App após o fim da partida. */
  onPerfilAtualizado: (p: PlayerProfile) => void
}

/**
 * Dono do ciclo de vida de uma partida. O App remonta este componente
 * (via key) para começar outra — assim o estado da anterior não vaza.
 */
export default function Partida({
  config,
  nickname,
  onSair,
  onJogarNovamente,
  onRanking,
  onPerfilAtualizado,
}: Props) {
  const quiz = useQuiz(config, nickname)

  useEffect(() => {
    if (quiz.perfil) onPerfilAtualizado(quiz.perfil)
  }, [quiz.perfil, onPerfilAtualizado])

  if (quiz.resultado) {
    return (
      <ResultScreen
        resultado={quiz.resultado}
        perfil={quiz.perfil}
        salvando={quiz.salvando}
        erroSalvar={quiz.erroSalvar}
        onJogarNovamente={onJogarNovamente}
        onRanking={onRanking}
        onInicio={onSair}
      />
    )
  }

  return <QuizScreen quiz={quiz} onSair={onSair} />
}
