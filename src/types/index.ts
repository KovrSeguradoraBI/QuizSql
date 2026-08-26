// Tipos de domínio do quiz. Base: PRD §6.3.
// Convenção: aqui tudo é camelCase. A tradução de/para o snake_case do
// Postgres acontece exclusivamente em src/lib/api.ts.

export type Difficulty = 'facil' | 'medio' | 'dificil'
export type QuestionType = 'multiple_choice' | 'true_false'

/** Faixas do jogador (PRD §3.3). */
export type Faixa = 'Aprendiz' | 'Analista Jr' | 'Analista' | 'DBA Jr'

export interface Question {
  id: string
  difficulty: Difficulty
  topic: string
  type: QuestionType
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  hint?: string
}

/**
 * Registro de uma resposta dentro da partida. É a entrada de badges.ts —
 * por isso guarda `topic` e `timeSpentSec`, e não só se acertou.
 */
export interface Answer {
  questionId: string
  difficulty: Difficulty
  topic: string
  /** Índice escolhido, ou null quando o tempo esgotou. */
  selectedIndex: number | null
  correct: boolean
  /** Segundos gastos nesta pergunta (inteiro, arredondado). */
  timeSpentSec: number
  hintUsed: boolean
  pointsEarned: number
  /** Streak imediatamente depois desta resposta (0 quando errou). */
  streakAfter: number
}

export interface GameResult {
  playerName: string
  score: number
  correct: number
  total: number
  timeSpentSec: number
  badges: string[]
  xpEarned: number
  /** ISO 8601. */
  date: string
}

/** Linha do ranking global, como vem de `game_results`. */
export interface LeaderboardEntry {
  id: number
  playerName: string
  score: number
  correct: number
  total: number
  badges: string[]
  createdAt: string
}

export interface PlayerProfile {
  deviceId: string
  nickname: string
  totalXp: number
  faixa: Faixa
  badges: string[]
}

export interface ScoreConfig {
  basePoints: Record<Difficulty, number>
  timePerQuestionSec: number
  timeBonusFactor: number
  streakThresholds: { streak: number; multiplier: number }[]
  hintPenalty: number
}

/** Definição estática de uma conquista (PRD §3.4). */
export interface BadgeDef {
  id: string
  emoji: string
  name: string
  description: string
}

/** Configuração escolhida na tela de início. */
export interface MatchConfig {
  /** null = todas as dificuldades. */
  difficulty: Difficulty | null
  questionCount: number
}
