// Regras de conquistas (PRD §3.4). Lógica pura: sem React, sem I/O.
// Cada badge é uma função de (respostas da partida, score final) -> boolean.

import type { Answer, BadgeDef } from '../types'

export const VELOCISTA_LIMITE_SEC = 5
export const VELOCISTA_QTD = 5
export const EM_CHAMAS_STREAK = 8
export const CENTURIAO_PONTOS = 500

export const BADGES: BadgeDef[] = [
  {
    id: 'perfeicao',
    emoji: '🎯',
    name: 'Perfeição',
    description: 'Conclua uma partida sem nenhum erro.',
  },
  {
    id: 'velocista',
    emoji: '⚡',
    name: 'Velocista',
    description: `Acerte ${VELOCISTA_QTD} perguntas em menos de ${VELOCISTA_LIMITE_SEC}s cada.`,
  },
  {
    id: 'em_chamas',
    emoji: '🔥',
    name: 'Em chamas',
    description: `Alcance um streak de ${EM_CHAMAS_STREAK} acertos seguidos.`,
  },
  {
    id: 'mestre_join',
    emoji: '🧠',
    name: 'Mestre do JOIN',
    description: 'Acerte todas as perguntas de JOIN da partida.',
  },
  {
    id: 'centuriao',
    emoji: '🏆',
    name: 'Centurião',
    description: `Some ${CENTURIAO_PONTOS} pontos ou mais em uma partida.`,
  },
]

export function badgeById(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id)
}

/** Partida sem nenhum erro (e com ao menos uma resposta). */
function temPerfeicao(answers: Answer[]): boolean {
  return answers.length > 0 && answers.every((a) => a.correct)
}

/**
 * 5 respostas corretas, cada uma em menos de 5s.
 * O PRD diz "5 respostas em menos de 5s cada"; contamos apenas acertos,
 * para que errar rápido não vire conquista.
 */
function temVelocista(answers: Answer[]): boolean {
  const rapidas = answers.filter(
    (a) => a.correct && a.timeSpentSec < VELOCISTA_LIMITE_SEC,
  )
  return rapidas.length >= VELOCISTA_QTD
}

/** Streak de 8 acertos em algum ponto da partida. */
function temEmChamas(answers: Answer[]): boolean {
  return answers.some((a) => a.streakAfter >= EM_CHAMAS_STREAK)
}

/**
 * Todas as perguntas de JOIN corretas — e a partida precisa ter tido ao
 * menos uma, senão a badge sairia de graça em partidas sem JOIN.
 * Depende de `topic` conter "JOIN" (ver supabase/seed.sql).
 */
function temMestreDoJoin(answers: Answer[]): boolean {
  const joins = answers.filter((a) => a.topic.toUpperCase().includes('JOIN'))
  return joins.length > 0 && joins.every((a) => a.correct)
}

function temCenturiao(score: number): boolean {
  return score >= CENTURIAO_PONTOS
}

/** Ids das badges conquistadas nesta partida. */
export function avaliarBadges(answers: Answer[], score: number): string[] {
  const conquistadas: string[] = []
  if (temPerfeicao(answers)) conquistadas.push('perfeicao')
  if (temVelocista(answers)) conquistadas.push('velocista')
  if (temEmChamas(answers)) conquistadas.push('em_chamas')
  if (temMestreDoJoin(answers)) conquistadas.push('mestre_join')
  if (temCenturiao(score)) conquistadas.push('centuriao')
  return conquistadas
}

/** União das badges já no perfil com as recém-conquistadas, sem repetir. */
export function mesclarBadges(atuais: string[], novas: string[]): string[] {
  return Array.from(new Set([...atuais, ...novas]))
}
