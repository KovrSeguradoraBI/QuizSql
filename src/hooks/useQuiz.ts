// Orquestração de uma partida: carregamento, timer, streak, pontuação,
// coleta de badges e fechamento (perfil + resultado no Supabase).
//
// O estado vive num useReducer para que toda transição seja pura e
// testável; o hook cuida apenas dos efeitos (rede e timer).

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { getQuestions, persistirPartida } from '../lib/api'
import { avaliarBadges } from '../lib/badges'
import { calcularPontos, SCORE_CONFIG, xpDaPartida } from '../lib/scoring'
import { getDeviceId } from '../lib/device'
import type {
  Answer,
  GameResult,
  MatchConfig,
  PlayerProfile,
  Question,
} from '../types'

/** Intervalo do timer. 100ms deixa a barra de tempo fluida. */
const TICK_MS = 100

export type QuizPhase = 'loading' | 'error' | 'answering' | 'feedback' | 'finished'

interface QuizState {
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

type Action =
  | { type: 'LOADED'; questions: Question[]; fromCache: boolean }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'TICK'; deltaMs: number }
  | { type: 'ANSWER'; selectedIndex: number }
  | { type: 'USE_HINT' }
  | { type: 'NEXT' }
  | { type: 'RESET' }

function estadoInicial(): QuizState {
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

function reducer(state: QuizState, action: Action): QuizState {
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

export interface UseQuizReturn {
  phase: QuizPhase
  questao: Question | null
  index: number
  total: number
  timeLeftSec: number
  timeTotalSec: number
  selectedIndex: number | null
  hintUsed: boolean
  streak: number
  score: number
  lastPoints: number
  lastTimedOut: boolean
  acertos: number
  error: string | null
  fromCache: boolean
  resultado: GameResult | null
  perfil: PlayerProfile | null
  salvando: boolean
  erroSalvar: string | null
  responder: (index: number) => void
  usarDica: () => void
  proxima: () => void
  recarregar: () => void
}

export function useQuiz(config: MatchConfig, nickname: string): UseQuizReturn {
  const [state, dispatch] = useReducer(reducer, undefined, estadoInicial)
  const [tentativa, setTentativa] = useState(0)
  const [perfil, setPerfil] = useState<PlayerProfile | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState<string | null>(null)

  const { difficulty, questionCount } = config

  // ------------------------------------------------------ carregar perguntas
  useEffect(() => {
    let cancelado = false
    dispatch({ type: 'RESET' })

    getQuestions(difficulty, questionCount).then((r) => {
      if (cancelado) return
      if (r.data && r.data.length > 0) {
        dispatch({
          type: 'LOADED',
          questions: r.data,
          fromCache: Boolean(r.fromCache),
        })
      } else {
        dispatch({
          type: 'LOAD_ERROR',
          error: r.error ?? 'Não foi possível carregar as perguntas.',
        })
      }
    })

    return () => {
      cancelado = true
    }
  }, [difficulty, questionCount, tentativa])

  // ------------------------------------------------------------------ timer
  // Um intervalo por pergunta; o cleanup garante que dois nunca coexistam.
  useEffect(() => {
    if (state.phase !== 'answering') return
    let anterior = performance.now()
    const id = window.setInterval(() => {
      const agora = performance.now()
      const delta = agora - anterior
      anterior = agora
      dispatch({ type: 'TICK', deltaMs: delta })
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [state.phase, state.index])

  // ------------------------------------------------------- resultado final
  const resultado = useMemo<GameResult | null>(() => {
    if (state.phase !== 'finished') return null
    const acertos = state.answers.filter((a) => a.correct).length
    return {
      playerName: nickname,
      score: state.score,
      correct: acertos,
      total: state.questions.length,
      timeSpentSec: state.answers.reduce((s, a) => s + a.timeSpentSec, 0),
      badges: avaliarBadges(state.answers, state.score),
      xpEarned: xpDaPartida(state.score),
      date: new Date().toISOString(),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase])

  // Persiste uma única vez. O ref é necessário porque o StrictMode do React
  // 18 executa os efeitos duas vezes em desenvolvimento.
  const persistidoRef = useRef(false)
  useEffect(() => {
    if (!resultado || persistidoRef.current) return
    persistidoRef.current = true

    setSalvando(true)
    persistirPartida(getDeviceId(), nickname, resultado).then((r) => {
      setPerfil(r.profile)
      setErroSalvar(r.error)
      setSalvando(false)
    })
  }, [resultado, nickname])

  useEffect(() => {
    persistidoRef.current = false
  }, [tentativa, difficulty, questionCount])

  // ----------------------------------------------------------------- ações
  const responder = useCallback((i: number) => {
    dispatch({ type: 'ANSWER', selectedIndex: i })
  }, [])
  const usarDica = useCallback(() => dispatch({ type: 'USE_HINT' }), [])
  const proxima = useCallback(() => dispatch({ type: 'NEXT' }), [])
  const recarregar = useCallback(() => setTentativa((t) => t + 1), [])

  return {
    phase: state.phase,
    questao: state.questions[state.index] ?? null,
    index: state.index,
    total: state.questions.length,
    timeLeftSec: state.timeLeftMs / 1000,
    timeTotalSec: state.totalMs / 1000,
    selectedIndex: state.selectedIndex,
    hintUsed: state.hintUsed,
    streak: state.streak,
    score: state.score,
    lastPoints: state.lastPoints,
    lastTimedOut: state.lastTimedOut,
    acertos: state.answers.filter((a) => a.correct).length,
    error: state.error,
    fromCache: state.fromCache,
    resultado,
    perfil,
    salvando,
    erroSalvar,
    responder,
    usarDica,
    proxima,
    recarregar,
  }
}
