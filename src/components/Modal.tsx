import { useEffect, useRef, type ReactNode } from 'react'

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

interface Props {
  aberto: boolean
  onFechar: () => void
  /** Nome acessível do diálogo. */
  label: string
  children: ReactNode
}

/**
 * Diálogo sobreposto com foco gerenciado.
 *
 * `aria-modal="true"` promete ao leitor de tela que nada fora daqui é
 * alcançável — sem mover e prender o foco, a promessa é falsa e a
 * navegação por teclado continua passeando pela página de trás.
 */
export default function Modal({ aberto, onFechar, label, children }: Props) {
  const caixaRef = useRef<HTMLDivElement>(null)
  const focoAnteriorRef = useRef<HTMLElement | null>(null)

  // Guarda quem tinha o foco, joga o foco para dentro, devolve ao fechar.
  useEffect(() => {
    if (!aberto) return

    focoAnteriorRef.current = document.activeElement as HTMLElement | null
    const primeiro = caixaRef.current?.querySelector<HTMLElement>(FOCAVEIS)
    // Sem nada focável, o próprio contêiner recebe o foco (tem tabIndex -1).
    ;(primeiro ?? caixaRef.current)?.focus()

    return () => focoAnteriorRef.current?.focus()
  }, [aberto])

  // Trava a rolagem do fundo enquanto o diálogo está aberto.
  useEffect(() => {
    if (!aberto) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = anterior
    }
  }, [aberto])

  // Escape fecha; Tab circula dentro do diálogo.
  useEffect(() => {
    if (!aberto) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onFechar()
        return
      }
      if (e.key !== 'Tab') return

      const alvos = caixaRef.current?.querySelectorAll<HTMLElement>(FOCAVEIS)
      if (!alvos || alvos.length === 0) return

      const primeiro = alvos[0]
      const ultimo = alvos[alvos.length - 1]
      const atual = document.activeElement

      if (e.shiftKey && atual === primeiro) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && atual === ultimo) {
        e.preventDefault()
        primeiro.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar()
      }}
    >
      <div
        ref={caixaRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl sm:p-6"
      >
        {children}
      </div>
    </div>
  )
}
