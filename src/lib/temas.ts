// Temas disponíveis. Os dois são escuros: o padrão é azulado com
// gradientes de fundo, o alternativo é preto neutro e chapado.
//
// A troca acontece redefinindo a escala `--color-slate-*` do Tailwind em
// `html[data-tema="preto"]` (ver index.css). Como toda utilitária
// `bg-slate-900` compila para `var(--color-slate-900)`, os componentes
// mudam de cor sem que nenhuma classe deles precise ser tocada.

export const TEMAS = [
  { id: 'azul', nome: 'Azulado', emoji: '🌌' },
  { id: 'preto', nome: 'Preto', emoji: '🌑' },
] as const

export type TemaId = (typeof TEMAS)[number]['id']

export const TEMA_PADRAO: TemaId = 'azul'

export function ehTemaValido(v: unknown): v is TemaId {
  return TEMAS.some((t) => t.id === v)
}

export function temaPorId(id: TemaId) {
  return TEMAS.find((t) => t.id === id) ?? TEMAS[0]
}

/** O outro tema — com dois, alternar é só pegar o seguinte. */
export function proximoTema(atual: TemaId): TemaId {
  const i = TEMAS.findIndex((t) => t.id === atual)
  return TEMAS[(i + 1) % TEMAS.length].id
}
