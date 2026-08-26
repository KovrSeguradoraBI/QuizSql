// Máquina de estados da partida. Lógica pura: sem React, sem I/O — mora
// aqui, ao lado de scoring.ts e badges.ts, e não dentro do hook, para que
// toda transição possa ser exercitada sem montar componente.
//
// O hook (hooks/useQuiz.ts) cuida só dos efeitos: rede e timer.

import { calcularPontos, SCORE_CONFIG } from './scoring'
import type { Answer, Question } from '../types'

export type QuizPhase = 'loading' | 'error' | 'answering' | 'feedback' | 'finished'

export interface QuizState {
  phase: QuizPhase
  questions: Question[]
  index: number
  /** Tempo restante da pergunta atual, em ms. */
  timeLeftMs: number
  totalMs: number
  selectedIndex: number | null
  hintUsed: boolean
  streak: number
  score: number
  answers: Answer[]
  error: string | null
  /** As perguntas vieram do cache local (Supabase indisponível). */
  fromCache: boolean
  /** Pontos ganhos na última resposta, para o feedback. */
  lastPoints: number
  /** A última resposta terminou por tempo esgotado. */
  lastTimedOut: boolean
}

export type Action =
  | { type: 'LOADED'; questions: Question[]; fromCache: boolean }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'TICK'; deltaMs: number }
  | { type: 'ANSWER'; selectedIndex: number }
  | { type: 'USE_HINT' }
  | { type: 'NEXT' }
  | { type: 'RESET' }

export function estadoInicial(): QuizState {
  const totalMs = SCORE_CONFIG.timePerQuestionSec * 1000
  return {
    phase: 'loading',
    questions: [],
    index: 0,
    timeLeftMs: totalMs,
    totalMs,
    selectedIndex: null,
    hintUsed: false,
    streak: 0,
    score: 0,
    answers: [],
    error: null,
    fromCache: false,
    lastPoints: 0,
    lastTimedOut: false,
  }
}

/**
 * Registra a resposta da pergunta atual e passa para o feedback.
 * `selectedIndex === null` significa tempo esgotado.
 *
 * Erro e timeout são tratados igual: 0 pontos e streak zerado (PRD §3.5).
 */
function registrarResposta(
  state: QuizState,
  selectedIndex: number | null,
  timeLeftMs: number,
): QuizState {
  const q = state.questions[state.index]
  if (!q) return state

  const timedOut = selectedIndex === null
  const correct = !timedOut && selectedIndex === q.correctIndex
  const streakAfter = correct ? state.streak + 1 : 0

  const pontos = correct
    ? calcularPontos(
        q.difficulty,
        timeLeftMs / 1000,
        SCORE_CONFIG.timePerQuestionSec,
        streakAfter,
        state.hintUsed,
      )
    : 0

  const answer: Answer = {
    questionId: q.id,
    difficulty: q.difficulty,
    topic: q.topic,
    selectedIndex,
    correct,
    timeSpentSec: Math.round((state.totalMs - Math.max(timeLeftMs, 0)) / 1000),
    hintUsed: state.hintUsed,
    pointsEarned: pontos,
    streakAfter,
  }

  return {
    ...state,
    phase: 'feedback',
    // Congela o tempo no instante da resposta — é ele que gerou o bônus.
    timeLeftMs: Math.max(timeLeftMs, 0),
    selectedIndex,
    streak: streakAfter,
    score: state.score + pontos,
    answers: [...state.answers, answer],
    lastPoints: pontos,
    lastTimedOut: timedOut,
  }
}

export function reducer(state: QuizState, action: Action): QuizState {
  switch (action.type) {
    case 'LOADED':
      return {
        ...state,
        phase: 'answering',
        questions: action.questions,
        fromCache: action.fromCache,
        error: null,
      }

    case 'LOAD_ERROR':
      return { ...state, phase: 'error', error: action.error }

    case 'TICK': {
      if (state.phase !== 'answering') return state
      const restante = state.timeLeftMs - action.deltaMs
      // Zerou o tempo: conta como erro, sem dispatch extra (evita corrida).
      if (restante <= 0) return registrarResposta(state, null, 0)
      return { ...state, timeLeftMs: restante }
    }

    case 'ANSWER':
      if (state.phase !== 'answering') return state
      return registrarResposta(state, action.selectedIndex, state.timeLeftMs)

    case 'USE_HINT':
      if (state.phase !== 'answering' || state.hintUsed) return state
      return { ...state, hintUsed: true }

    case 'NEXT': {
      if (state.phase !== 'feedback') return state
      const proximo = state.index + 1
      if (proximo >= state.questions.length) {
        return { ...state, phase: 'finished' }
      }
      return {
        ...state,
        phase: 'answering',
        index: proximo,
        timeLeftMs: state.totalMs,
        selectedIndex: null,
        hintUsed: false,
        lastPoints: 0,
        lastTimedOut: false,
      }
    }

    case 'RESET':
      return estadoInicial()

    default:
      return state
  }
}
