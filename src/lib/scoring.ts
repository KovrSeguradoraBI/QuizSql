// Regras de pontuação e progressão. Lógica pura: sem React, sem I/O.
// Fonte: PRD §3.1, §3.2, §3.3 e §6.4.

import type { Difficulty, Faixa, ScoreConfig } from '../types'

/**
 * Única fonte de verdade dos números do jogo. Nada de constante de
 * pontuação espalhada por componente.
 */
export const SCORE_CONFIG: ScoreConfig = {
  basePoints: { facil: 10, medio: 20, dificil: 30 },
  timePerQuestionSec: 30,
  timeBonusFactor: 0.5,
  // Ordem decrescente: o primeiro limiar atingido é o que vale.
  streakThresholds: [
    { streak: 8, multiplier: 2.0 },
    { streak: 5, multiplier: 1.5 },
    { streak: 3, multiplier: 1.2 },
  ],
  hintPenalty: 0.5,
}

/** Faixas de XP (PRD §3.3), da mais alta para a mais baixa. */
const FAIXAS: { xp: number; faixa: Faixa }[] = [
  { xp: 1500, faixa: 'DBA Jr' },
  { xp: 800, faixa: 'Analista' },
  { xp: 300, faixa: 'Analista Jr' },
  { xp: 0, faixa: 'Aprendiz' },
]

/**
 * Multiplicador de combo para um streak já contabilizado.
 * `streak` é a quantidade de acertos consecutivos INCLUINDO o atual.
 */
export function multiplicadorPorStreak(
  streak: number,
  config: ScoreConfig = SCORE_CONFIG,
): number {
  const faixa = config.streakThresholds.find((t) => streak >= t.streak)
  return faixa ? faixa.multiplier : 1
}

/**
 * Bônus por responder rápido (PRD §3.2):
 *   bonus = round(base * timeBonusFactor * (tempoRestante / tempoTotal))
 */
export function bonusTempo(
  base: number,
  tempoRestanteSec: number,
  tempoTotalSec: number,
  config: ScoreConfig = SCORE_CONFIG,
): number {
  if (tempoTotalSec <= 0) return 0
  const restante = Math.min(Math.max(tempoRestanteSec, 0), tempoTotalSec)
  return Math.round(base * config.timeBonusFactor * (restante / tempoTotalSec))
}

/**
 * Pontos de UMA pergunta respondida CORRETAMENTE (PRD §6.4):
 *   round((base + bonusTempo) * multStreak * (dicaUsada ? 0.5 : 1))
 *
 * Resposta errada ou tempo esgotado valem 0 e não passam por aqui —
 * quem chama zera o streak nesses casos.
 */
export function calcularPontos(
  difficulty: Difficulty,
  tempoRestanteSec: number,
  tempoTotalSec: number,
  streakAposAcerto: number,
  dicaUsada: boolean,
  config: ScoreConfig = SCORE_CONFIG,
): number {
  const base = config.basePoints[difficulty]
  const bonus = bonusTempo(base, tempoRestanteSec, tempoTotalSec, config)
  const mult = multiplicadorPorStreak(streakAposAcerto, config)
  const fatorDica = dicaUsada ? 1 - config.hintPenalty : 1
  return Math.round((base + bonus) * mult * fatorDica)
}

/** Faixa correspondente à XP total acumulada. */
export function faixaPorXp(totalXp: number): Faixa {
  return FAIXAS.find((f) => totalXp >= f.xp)?.faixa ?? 'Aprendiz'
}

/** XP que ainda falta para a próxima faixa; null se já está na última. */
export function proximaFaixa(
  totalXp: number,
): { faixa: Faixa; faltam: number } | null {
  // FAIXAS está em ordem decrescente; a próxima é a última acima do XP atual.
  const acima = FAIXAS.filter((f) => f.xp > totalXp)
  if (acima.length === 0) return null
  const proxima = acima[acima.length - 1]
  return { faixa: proxima.faixa, faltam: proxima.xp - totalXp }
}

/**
 * XP ganha na partida.
 *
 * O PRD define as faixas (§3.3) mas não a conversão de partida em XP.
 * Assumimos XP = pontos da partida, o que mantém uma única moeda de
 * progressão e torna as faixas alcançáveis em poucas partidas.
 */
export function xpDaPartida(score: number): number {
  return score
}
