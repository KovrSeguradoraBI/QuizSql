// Identidade do jogador sem login (PRD §6.1).
//
// O device_id é um UUID gerado uma única vez no cliente. Ele é a PK de
// `players` e a FK de `game_results` — é o que liga XP e badges entre
// partidas. Perder o localStorage significa virar um jogador novo, o que
// é aceitável no MVP (o roadmap prevê Supabase Auth).

import { KEYS, readRaw, writeRaw } from './storage'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function gerarUuid(): string {
  // crypto.randomUUID exige contexto seguro (https ou localhost). O
  // fallback cobre casos como acesso por IP em rede local.
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // versão 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // variante RFC 4122
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-')
}

/**
 * Device id persistente. Gera e grava na primeira chamada.
 * Um valor inválido em disco é substituído — a coluna é `uuid` no
 * Postgres e um insert com lixo falharia em toda partida.
 */
export function getDeviceId(): string {
  const salvo = readRaw(KEYS.deviceId)
  if (salvo && UUID_RE.test(salvo)) return salvo

  const novo = gerarUuid()
  writeRaw(KEYS.deviceId, novo)
  return novo
}

export function getNickname(): string {
  return readRaw(KEYS.nickname) ?? ''
}

export function setNickname(nickname: string): void {
  writeRaw(KEYS.nickname, nickname.trim().slice(0, 24))
}
