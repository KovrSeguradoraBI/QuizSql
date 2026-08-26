// Camada de acesso a dados (PRD §6.6). Única porta de entrada para o
// Supabase — componentes e hooks importam daqui, nunca do supabaseClient.
//
// Três responsabilidades vivem só neste arquivo:
//   1. tradução snake_case (Postgres) <-> camelCase (domínio TS);
//   2. embaralhamento de perguntas e alternativas no cliente (§6.6);
//   3. resiliência de rede (RNF04): cache de perguntas e fila de reenvio.

import { supabase, isSupabaseConfigured } from './supabaseClient'
import { KEYS, readJson, writeJson, removeRaw } from './storage'
import { faixaPorXp } from './scoring'
import { mesclarBadges } from './badges'
import type {
  Difficulty,
  GameResult,
  LeaderboardEntry,
  PlayerProfile,
  Question,
} from '../types'

/** Resultado de qualquer chamada: a UI decide o que mostrar. */
export interface ApiResult<T> {
  data: T | null
  /** Mensagem pronta para exibir, ou null em caso de sucesso. */
  error: string | null
  /** true quando o dado veio do cache local em vez da rede. */
  fromCache?: boolean
}

const SEM_CONFIG =
  'Supabase não configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.'

function mensagemDeErro(e: unknown, contexto: string): string {
  const detalhe =
    e instanceof Error ? e.message : typeof e === 'string' ? e : 'erro desconhecido'
  return `${contexto}: ${detalhe}`
}

// ---------------------------------------------------------------- mapeamento

interface QuestionRow {
  id: string
  difficulty: Difficulty
  topic: string
  type: Question['type']
  question: string
  options: unknown
  correct_index: number
  explanation: string
  hint: string | null
}

function rowToQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    difficulty: row.difficulty,
    topic: row.topic,
    type: row.type,
    question: row.question,
    // `options` é jsonb; o SDK já devolve array, mas uma linha malformada
    // no seed não deve derrubar a partida inteira.
    options: Array.isArray(row.options) ? (row.options as string[]) : [],
    correctIndex: row.correct_index,
    explanation: row.explanation,
    hint: row.hint ?? undefined,
  }
}

interface GameResultRow {
  id: number
  player_name: string
  score: number
  correct: number
  total: number
  badges: unknown
  created_at: string
}

function rowToLeaderboardEntry(row: GameResultRow): LeaderboardEntry {
  return {
    id: row.id,
    playerName: row.player_name,
    score: row.score,
    correct: row.correct,
    total: row.total,
    badges: Array.isArray(row.badges) ? (row.badges as string[]) : [],
    createdAt: row.created_at,
  }
}

function resultToRow(deviceId: string, r: GameResult) {
  return {
    device_id: deviceId,
    player_name: r.playerName,
    score: r.score,
    correct: r.correct,
    total: r.total,
    time_spent_sec: r.timeSpentSec,
    badges: r.badges,
    xp_earned: r.xpEarned,
  }
}

// -------------------------------------------------------------- embaralhamento

/** Fisher-Yates sobre uma cópia. */
function embaralhar<T>(arr: readonly T[]): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Embaralha as alternativas recalculando `correctIndex` no mesmo passo —
 * separar as duas coisas é o jeito clássico de quebrar o gabarito.
 * Verdadeiro/Falso fica na ordem original: inverter só confunde.
 */
function embaralharAlternativas(q: Question): Question {
  if (q.type === 'true_false' || q.options.length < 2) return q
  const indices = embaralhar(q.options.map((_, i) => i))
  return {
    ...q,
    options: indices.map((i) => q.options[i]),
    correctIndex: indices.indexOf(q.correctIndex),
  }
}

function prepararPartida(
  questions: Question[],
  difficulty: Difficulty | null,
  limit: number,
): Question[] {
  const filtradas = difficulty
    ? questions.filter((q) => q.difficulty === difficulty)
    : questions
  return embaralhar(filtradas).slice(0, limit).map(embaralharAlternativas)
}

// -------------------------------------------------------------------- leitura

/**
 * Perguntas para uma partida. Busca o conjunto filtrado, embaralha
 * perguntas e alternativas no cliente e corta em `limit`.
 *
 * Guarda o banco completo em cache: sem perguntas não existe jogo, então
 * este cache é o que sustenta o critério "o app não trava se o Supabase
 * falhar". Em caso de falha, joga com o que estiver em cache.
 */
export async function getQuestions(
  difficulty: Difficulty | null,
  limit: number,
): Promise<ApiResult<Question[]>> {
  const cache = () => readJson<Question[]>(KEYS.questionsCache, [])

  const doCache = (erro: string): ApiResult<Question[]> => {
    const salvas = cache()
    if (salvas.length === 0) return { data: null, error: erro }
    return {
      data: prepararPartida(salvas, difficulty, limit),
      error: null,
      fromCache: true,
    }
  }

  if (!supabase) return doCache(SEM_CONFIG)

  try {
    const { data, error } = await supabase
      .from('questions')
      .select(
        'id, difficulty, topic, type, question, options, correct_index, explanation, hint',
      )
    if (error) throw error

    const todas = (data as QuestionRow[]).map(rowToQuestion)
    if (todas.length === 0) {
      return {
        data: null,
        error:
          'Nenhuma pergunta cadastrada. Rode supabase/seed.sql no SQL Editor.',
      }
    }

    writeJson(KEYS.questionsCache, todas)
    const partida = prepararPartida(todas, difficulty, limit)
    if (partida.length === 0) {
      return {
        data: null,
        error: 'Nenhuma pergunta encontrada para a dificuldade escolhida.',
      }
    }
    return { data: partida, error: null }
  } catch (e) {
    return doCache(mensagemDeErro(e, 'Falha ao carregar as perguntas'))
  }
}

/** Melhores resultados, ordenados por score desc (PRD §6.6). */
export async function getLeaderboard(
  limit = 20,
): Promise<ApiResult<LeaderboardEntry[]>> {
  if (!supabase) return { data: null, error: SEM_CONFIG }

  try {
    const { data, error } = await supabase
      .from('game_results')
      .select('id, player_name, score, correct, total, badges, created_at')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true }) // desempate: quem chegou antes
      .limit(limit)
    if (error) throw error
    return { data: (data as GameResultRow[]).map(rowToLeaderboardEntry), error: null }
  } catch (e) {
    return { data: null, error: mensagemDeErro(e, 'Falha ao carregar o ranking') }
  }
}

interface PlayerRow {
  device_id: string
  nickname: string
  total_xp: number
  faixa: string
  badges: unknown
}

function rowToProfile(row: PlayerRow): PlayerProfile {
  return {
    deviceId: row.device_id,
    nickname: row.nickname,
    totalXp: row.total_xp,
    faixa: faixaPorXp(row.total_xp), // recalcula: a coluna é só denormalização
    badges: Array.isArray(row.badges) ? (row.badges as string[]) : [],
  }
}

/** Perfil atual. `data: null` sem erro significa jogador novo. */
export async function getProfile(
  deviceId: string,
): Promise<ApiResult<PlayerProfile>> {
  if (!supabase) return { data: null, error: SEM_CONFIG }

  try {
    const { data, error } = await supabase
      .from('players')
      .select('device_id, nickname, total_xp, faixa, badges')
      .eq('device_id', deviceId)
      .maybeSingle()
    if (error) throw error
    return { data: data ? rowToProfile(data as PlayerRow) : null, error: null }
  } catch (e) {
    return { data: null, error: mensagemDeErro(e, 'Falha ao carregar o perfil') }
  }
}

// -------------------------------------------------------------------- escrita

/**
 * Acumula XP e badges no perfil (upsert por device_id).
 * Lê o perfil antes para somar em vez de sobrescrever — o XP é cumulativo.
 */
export async function upsertProfile(
  deviceId: string,
  nickname: string,
  xpDelta: number,
  badges: string[],
): Promise<ApiResult<PlayerProfile>> {
  if (!supabase) return { data: null, error: SEM_CONFIG }

  try {
    const atual = await getProfile(deviceId)
    const totalXp = (atual.data?.totalXp ?? 0) + xpDelta
    const todasBadges = mesclarBadges(atual.data?.badges ?? [], badges)
    const faixa = faixaPorXp(totalXp)

    const { data, error } = await supabase
      .from('players')
      .upsert(
        {
          device_id: deviceId,
          nickname,
          total_xp: totalXp,
          faixa,
          badges: todasBadges,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'device_id' },
      )
      .select('device_id, nickname, total_xp, faixa, badges')
      .single()
    if (error) throw error
    return { data: rowToProfile(data as PlayerRow), error: null }
  } catch (e) {
    return { data: null, error: mensagemDeErro(e, 'Falha ao salvar o perfil') }
  }
}

/** Insere a linha em game_results. Não trata erro: quem chama decide. */
async function inserirResultado(
  deviceId: string,
  result: GameResult,
): Promise<void> {
  if (!supabase) throw new Error(SEM_CONFIG)
  const { error } = await supabase
    .from('game_results')
    .insert(resultToRow(deviceId, result))
  if (error) throw error
}

/**
 * Grava apenas o resultado em game_results (PRD §6.6).
 *
 * Atenção: game_results.device_id tem FK para players, então o perfil
 * precisa existir antes. Prefira persistirPartida(), que cuida da ordem.
 */
export async function saveResult(
  deviceId: string,
  result: GameResult,
): Promise<ApiResult<null>> {
  try {
    await inserirResultado(deviceId, result)
    return { data: null, error: null }
  } catch (e) {
    return { data: null, error: mensagemDeErro(e, 'Falha ao salvar o resultado') }
  }
}

interface PendingResult {
  deviceId: string
  nickname: string
  result: GameResult
  /** O upsert do perfil ainda não foi aplicado (XP/badges pendentes). */
  needProfile: boolean
  /** A linha em game_results ainda não foi inserida. */
  needResult: boolean
}

function enfileirar(item: PendingResult): void {
  const fila = readJson<PendingResult[]>(KEYS.pendingResults, [])
  // Teto para a fila não crescer sem limite em uso offline prolongado.
  writeJson(KEYS.pendingResults, [...fila, item].slice(-20))
}

export interface PersistResult {
  profile: PlayerProfile | null
  /** Mensagem para a UI, ou null se tudo foi gravado. */
  error: string | null
  /** true quando algo ficou na fila para reenvio. */
  queued: boolean
}

/**
 * Fecha a partida: perfil primeiro (por causa do FK), resultado depois.
 * O que falhar vai para a fila local com a marcação do que ainda falta,
 * para o reenvio não duplicar XP nem tentar um insert que o FK recusaria.
 *
 * O jogador nunca perde a partida por causa da rede (RNF04).
 */
export async function persistirPartida(
  deviceId: string,
  nickname: string,
  result: GameResult,
): Promise<PersistResult> {
  writeJson(KEYS.lastResult, result)

  const perfil = await upsertProfile(
    deviceId,
    nickname,
    result.xpEarned,
    result.badges,
  )
  const perfilOk = perfil.error === null

  let resultadoErro: string | null = null
  if (perfilOk) {
    try {
      await inserirResultado(deviceId, result)
    } catch (e) {
      resultadoErro = mensagemDeErro(e, 'Falha ao enviar o resultado')
    }
  }

  const needProfile = !perfilOk
  const needResult = !perfilOk || resultadoErro !== null

  if (needProfile || needResult) {
    enfileirar({ deviceId, nickname, result, needProfile, needResult })
    return {
      profile: perfil.data,
      error:
        (perfil.error ?? resultadoErro ?? 'Falha ao gravar a partida') +
        ' — guardado no dispositivo e reenviado na próxima abertura.',
      queued: true,
    }
  }

  return { profile: perfil.data, error: null, queued: false }
}

/**
 * Drena a fila de pendências. Chamada na abertura do app.
 * Retorna quantas partidas foram enviadas por completo; o que falhar
 * continua na fila com as marcações atualizadas.
 */
export async function flushPendingResults(): Promise<number> {
  if (!supabase) return 0

  const fila = readJson<PendingResult[]>(KEYS.pendingResults, [])
  if (fila.length === 0) return 0

  const restantes: PendingResult[] = []
  let enviados = 0

  for (const item of fila) {
    let { needProfile, needResult } = item

    if (needProfile) {
      const r = await upsertProfile(
        item.deviceId,
        item.nickname,
        item.result.xpEarned,
        item.result.badges,
      )
      if (r.error === null) needProfile = false
    }

    // Sem perfil gravado o insert bateria no FK — nem tenta.
    if (!needProfile && needResult) {
      try {
        await inserirResultado(item.deviceId, item.result)
        needResult = false
      } catch {
        // segue pendente
      }
    }

    if (needProfile || needResult) restantes.push({ ...item, needProfile, needResult })
    else enviados++
  }

  if (restantes.length === 0) removeRaw(KEYS.pendingResults)
  else writeJson(KEYS.pendingResults, restantes)

  return enviados
}

export function contarPendentes(): number {
  return readJson<PendingResult[]>(KEYS.pendingResults, []).length
}

export { isSupabaseConfigured }
