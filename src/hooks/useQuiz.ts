// Efeitos de uma partida: carregamento das perguntas, timer e o
// fechamento (perfil + resultado no Supabase).
//
// Todas as transições de estado vivem em lib/quizReducer.ts, que é puro —
// este arquivo só liga o mundo externo a ele.

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { getQuestions, persistirPartida } from '../lib/api'
import { avaliarBadges } from '../lib/badges'
import { estadoInicial, reducer, type QuizPhase } from '../lib/quizReducer'
import { xpDaPartida } from '../lib/scoring'
import { getDeviceId } from '../lib/device'
import type {
  GameResult,
  MatchConfig,
  PlayerProfile,
  Question,
} from '../types'

/** Intervalo do timer. 100ms deixa a barra de tempo fluida. */
const TICK_MS = 100

export type { QuizPhase }

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
