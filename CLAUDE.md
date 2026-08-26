# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado atual

Projeto **greenfield**: o único artefato é `prd.md` (PRD v1.0, em português). Não há código,
`package.json`, git ou `node_modules`. **`prd.md` é a fonte da verdade** — leia-o antes de
implementar qualquer coisa; a seção 7 (Critérios de Aceite) é o checklist de pronto.

Ambiente desta máquina:
- **Node/npm não estão instalados** (nem no PATH nem em `C:\Program Files\nodejs`). Instalar Node 20.x
  é o primeiro passo antes de qualquer `npm`.
- O diretório fica dentro do **OneDrive** e o caminho tem espaços e acentos
  (`OneDrive - INVESTPREV SEGURADORA SA\Área de Trabalho\...`). Sempre cite caminhos entre aspas.
  Considere excluir `node_modules` da sincronização do OneDrive.
- Shell padrão é PowerShell 5.1: sem `&&`/`||`, sem `??`/`?.`. Use `A; if ($?) { B }`.

## Stack e comandos (após o scaffold)

React 18 + TypeScript, Vite, Tailwind CSS, `@supabase/supabase-js`. Deploy: Vercel (frontend) +
Supabase gerenciado.

```
npm install
npm run dev            # dev server Vite
npm run build          # -> dist/  (Output Directory na Vercel)
npm run preview
```

Não há suíte de testes definida no PRD. Se adicionar testes, prefira Vitest (integra com Vite) e
documente aqui o comando de teste único.

`.env` (nunca commitar; criar também `.env.example`):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
Vite injeta `VITE_*` no bundle do cliente — **somente a anon key**, nunca `service_role`. A proteção
real vem do RLS definido em `supabase/schema.sql`.

## Arquitetura

Fluxo de telas (state machine única em `App.tsx` ou `useQuiz`): Start → Config da partida → Quiz →
Result → Leaderboard → rejogar.

Três camadas, na ordem em que a lógica deve fluir:

1. **`src/lib/api.ts`** — única porta de entrada para o Supabase. Toda a app fala com o backend por
   `getQuestions`, `saveResult`, `getLeaderboard`, `upsertProfile`, `getProfile`. Nenhum componente
   deve importar `supabaseClient` direto.
2. **`src/lib/scoring.ts` + `src/lib/badges.ts`** — regras de jogo puras (sem React, sem I/O), o que
   as torna a superfície natural para testes. O cálculo canônico está no PRD §3.2/§6.4:
   `round((base + bonusTempo) * multStreak * (dicaUsada ? 0.5 : 1))`, com
   `bonusTempo = round(base * 0.5 * tempoRestante/tempoTotal)`. Base: fácil 10 / médio 20 / difícil 30.
   Erro **ou timeout** = 0 pontos e streak zerado.
3. **`src/hooks/useQuiz.ts`** — orquestra timer, índice da pergunta, streak, acumulação de pontos e
   coleta de badges. Componentes em `src/components/` são de apresentação.

**Identidade sem login:** `src/lib/device.ts` gera um UUID uma vez e guarda em `localStorage`
(`quiz_sqlserver_device_id`). Esse `device_id` é a PK de `players` e a FK de `game_results` — é o que
liga XP/badges entre partidas. `localStorage` guarda **apenas** `device_id`, apelido e cache do último
resultado; a verdade está no Postgres.

**Mapeamento de nomes:** o schema Postgres é `snake_case` (`correct_index`, `time_spent_sec`,
`xp_earned`) e os tipos TS são `camelCase` (`correctIndex`, `timeSpentSec`, `xpEarned`). A conversão
pertence a `api.ts`; `src/types/index.ts` só descreve o formato do domínio.

**Degradação graciosa (RNF04) é requisito de aceite, não polimento:** falha de rede não pode impedir
jogar. Toda chamada em `api.ts` trata erro e expõe loading/erro; se `saveResult` falhar, o resultado
vai para uma fila em `localStorage` para reenvio.

## Dados

`supabase/schema.sql` (tabelas `questions`, `players`, `game_results` + RLS/policies) e
`supabase/seed.sql` (mín. 20 perguntas) são versionados e aplicados manualmente no projeto Supabase —
não há migrations automatizadas no MVP. As perguntas são conteúdo editável por SQL: **adicionar
pergunta nunca deve exigir mudança de código** (RNF05). Temas obrigatórios da seed no PRD §6.8.

As policies de escrita estão abertas para `anon` porque o MVP não tem auth (PRD §6.7, nota de
segurança) — decisão consciente para uso interno. Não "corrija" isso sem migrar para Supabase Auth,
que é item de roadmap.

## Contradições conhecidas no PRD

O PRD é v1.0 e tem resquícios de uma versão anterior 100% client-side. **Supabase vence** (§2.3, §6,
e os critérios de aceite de §7 exigem explicitamente leitura/escrita no Supabase). Trate como
obsoletos: RF01 ("carregar de arquivo JSON"), RF08/RF09 ("persistir ranking no `localStorage`") e
§8 ("MVP 100% client-side, sem dependência de backend"). Se algo mais parecer conflitante, prefira
§6 e §7.

O PRD §6.2 sugere a pasta `quiz-sqlserver/`. O diretório atual já é a raiz do projeto — confirme com
o usuário antes de criar uma subpasta extra.
