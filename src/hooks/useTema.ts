import { useCallback, useEffect, useState } from 'react'
import { KEYS, readRaw, writeRaw } from '../lib/storage'
import {
  ehTemaValido,
  proximoTema,
  TEMA_PADRAO,
  temaPorId,
  type TemaId,
} from '../lib/temas'

/** Lê a preferência salva; cai no padrão se ausente ou corrompida. */
function temaSalvo(): TemaId {
  const v = readRaw(KEYS.tema)
  return ehTemaValido(v) ? v : TEMA_PADRAO
}

/**
 * Tema atual e o alternador.
 *
 * O estado inicial vem do `data-tema` que o script inline do index.html já
 * aplicou antes do primeiro paint — ler dali em vez do localStorage evita
 * divergir do que a tela está mostrando.
 */
export function useTema() {
  const [tema, setTema] = useState<TemaId>(() => {
    const doDom = document.documentElement.dataset.tema
    return ehTemaValido(doDom) ? doDom : temaSalvo()
  })

  useEffect(() => {
    document.documentElement.dataset.tema = tema
    writeRaw(KEYS.tema, tema)
  }, [tema])

  const alternar = useCallback(() => setTema((t) => proximoTema(t)), [])

  return {
    tema,
    atual: temaPorId(tema),
    proximo: temaPorId(proximoTema(tema)),
    alternar,
  }
}
