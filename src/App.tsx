import { useCallback, useEffect, useState } from 'react'
import Leaderboard from './components/Leaderboard'
import Partida from './components/Partida'
import StartScreen from './components/StartScreen'
import { contarPendentes, flushPendingResults, getProfile } from './lib/api'
import { getDeviceId, getNickname, setNickname as salvarNickname } from './lib/device'
import { isSupabaseConfigured } from './lib/supabaseClient'
import type { MatchConfig, PlayerProfile } from './types'

/**
 * Máquina de estados de TELAS. A máquina de estados da PARTIDA é outra e
 * vive em useQuiz — as duas não se misturam.
 * O ranking é uma sobreposição, não uma tela: assim abri-lo a partir do
 * resultado não descarta a partida recém-concluída.
 */
type Tela = 'inicio' | 'partida'

const CONFIG_PADRAO: MatchConfig = { difficulty: null, questionCount: 10 }

export default function App() {
  const [tela, setTela] = useState<Tela>('inicio')
  const [rankingAberto, setRankingAberto] = useState(false)
  const [nickname, setNick] = useState(getNickname)
  const [config, setConfig] = useState<MatchConfig>(CONFIG_PADRAO)
  const [perfil, setPerfil] = useState<PlayerProfile | null>(null)
  const [carregandoPerfil, setCarregandoPerfil] = useState(isSupabaseConfigured)
  /** Remonta o <Partida> a cada nova partida. */
  const [partidaKey, setPartidaKey] = useState(0)
  const [reenviados, setReenviados] = useState(0)

  // Abertura do app: drena a fila de partidas pendentes e carrega o perfil.
  useEffect(() => {
    let cancelado = false
    const deviceId = getDeviceId()

    async function iniciar() {
      if (contarPendentes() > 0) {
        const n = await flushPendingResults()
        if (!cancelado && n > 0) setReenviados(n)
      }
      const r = await getProfile(deviceId)
      if (cancelado) return
      if (r.data) {
        setPerfil(r.data)
        // O apelido do servidor vence o local só se não houver nada digitado.
        setNick((atual) => atual || r.data!.nickname)
      }
      setCarregandoPerfil(false)
    }

    iniciar()
    return () => {
      cancelado = true
    }
  }, [])

  const onNicknameChange = useCallback((v: string) => {
    setNick(v)
    salvarNickname(v)
  }, [])

  const jogar = useCallback(() => {
    salvarNickname(nickname)
    setPartidaKey((k) => k + 1)
    setTela('partida')
  }, [nickname])

  const voltarAoInicio = useCallback(() => setTela('inicio'), [])
  const abrirRanking = useCallback(() => setRankingAberto(true), [])
  const fecharRanking = useCallback(() => setRankingAberto(false), [])
  const onPerfilAtualizado = useCallback((p: PlayerProfile) => setPerfil(p), [])

  useEffect(() => {
    if (!rankingAberto) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') fecharRanking()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [rankingAberto, fecharRanking])

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-6 sm:py-10">
      {!isSupabaseConfigured && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          Supabase não configurado. Copie <code>.env.example</code> para{' '}
          <code>.env</code> e preencha com os dados de Supabase → Project Settings
          → API.
        </p>
      )}

      {reenviados > 0 && (
        <p className="mb-4 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-200">
          ✅ {reenviados}{' '}
          {reenviados === 1 ? 'partida pendente foi enviada' : 'partidas pendentes foram enviadas'}{' '}
          ao servidor.
        </p>
      )}

      <main className="flex-1">
        {tela === 'inicio' && (
          <StartScreen
            nickname={nickname}
            onNicknameChange={onNicknameChange}
            config={config}
            onConfigChange={setConfig}
            perfil={perfil}
            carregandoPerfil={carregandoPerfil}
            onJogar={jogar}
            onRanking={abrirRanking}
          />
        )}

        {tela === 'partida' && (
          <Partida
            key={partidaKey}
            config={config}
            nickname={nickname.trim()}
            onSair={voltarAoInicio}
            onJogarNovamente={jogar}
            onRanking={abrirRanking}
            onPerfilAtualizado={onPerfilAtualizado}
          />
        )}
      </main>

      <footer className="mt-8 text-center text-xs text-slate-600">
        Quiz SQL Server · nível básico · dados no Supabase
      </footer>

      {rankingAberto && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Ranking global"
          onClick={(e) => {
            if (e.target === e.currentTarget) fecharRanking()
          }}
        >
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl sm:p-6">
            <Leaderboard nickname={nickname.trim()} onVoltar={fecharRanking} />
          </div>
        </div>
      )}
    </div>
  )
}
