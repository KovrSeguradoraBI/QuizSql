// Acesso ao localStorage. Todas as chaves do app vivem aqui.
//
// O localStorage é apenas apoio (PRD §6.5): device_id, apelido, último
// resultado, cache de perguntas e fila de reenvio. A verdade está no
// Postgres. Todo acesso é protegido — em modo privado ou com cookies
// bloqueados o próprio getter lança, e o jogo não pode cair por isso.

export const KEYS = {
  deviceId: 'quiz_sqlserver_device_id',
  nickname: 'quiz_sqlserver_nickname',
  lastResult: 'quiz_sqlserver_last_result',
  questionsCache: 'quiz_sqlserver_questions_cache',
  pendingResults: 'quiz_sqlserver_pending_results',
} as const

export function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeRaw(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Cota estourada ou storage indisponível: seguir sem cache.
  }
}

export function removeRaw(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignora
  }
}

export function readJson<T>(key: string, fallback: T): T {
  const raw = readRaw(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    // Valor corrompido: descarta para não repetir o erro a cada carga.
    removeRaw(key)
    return fallback
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    writeRaw(key, JSON.stringify(value))
  } catch {
    // Valor não serializável: ignora.
  }
}
