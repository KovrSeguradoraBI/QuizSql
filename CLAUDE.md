# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Quiz web de SQL Server básico com gamificação. `prd.md` é a especificação de origem —
a seção 7 (Critérios de Aceite) é o checklist de pronto. `README.md` cobre setup e deploy.

## Comandos

```
npm run dev            # dev server Vite
npm run build          # tsc -b && vite build  ->  dist/
npm run preview
npm run lint           # só o typecheck (tsc --noEmit)
```

Não há suíte de testes: decisão explícita para o MVP. Se adicionar testes, use Vitest
(integra com o Vite) e comece por `scoring.ts`/`badges.ts`, que são lógica pura.

## Ambiente desta máquina

- **Node 24.19.0** em `C:\Program Files\nodejs` (instalado via winget — o pacote
  `OpenJS.NodeJS.LTS` hoje aponta para a 24, não para a 20 do PRD §6.9; o Vite não se
  importa). Se `node` não estiver no PATH da sessão, prefixe:
  `export PATH="$PATH:/c/Program Files/nodejs"`.
- O diretório fica dentro do **OneDrive** e o caminho tem espaços e acentos
  (`OneDrive - INVESTPREV SEGURADORA SA\Área de Trabalho\...`). Cite caminhos entre aspas.
- Shell padrão é PowerShell 5.1: sem `&&`/`||`, sem `??`/`?.`. Use `A; if ($?) { B }`.
- Heredocs de Bash com SQL/TSX cheio de aspas simples já quebraram o parse aqui — para
  esses arquivos, use o Write.

## Estado do projeto

O código do MVP está implementado e `npm run build` passa. **Não foi possível validar
nada contra o Supabase de verdade**: falta preencher o `.env` (o usuário ainda vai
buscar as chaves em Supabase → Project Settings → API) e aplicar
`supabase/schema.sql` + `supabase/seed.sql` no SQL Editor. Até isso acontecer, o app
sobe mas avisa que o Supabase não está configurado. O deploy na Vercel também está
pendente.

## Arquitetura

Duas máquinas de estado **separadas**, e confundi-las é o erro mais fácil aqui:
`App.tsx` controla as **telas** (`inicio` | `partida`), e `hooks/useQuiz.ts` controla a
**partida** (`loading` → `answering` → `feedback` → `finished`). O ranking é uma
sobreposição (overlay), não uma tela — abri-lo a partir do resultado não descarta a
partida recém-concluída.

Camadas, na ordem em que a lógica flui:

1. **`src/lib/api.ts`** — única fronteira com o Supabase. Nenhum componente importa
   `supabaseClient` direto. Concentra três coisas: tradução `snake_case`↔`camelCase`,
   embaralhamento de perguntas/alternativas, e resiliência de rede.
2. **`src/lib/scoring.ts` + `src/lib/badges.ts`** — regras puras, sem React e sem I/O.
   `SCORE_CONFIG` é a única fonte dos números do jogo; não espalhe constantes de
   pontuação pelos componentes.
3. **`src/hooks/useQuiz.ts`** — `useReducer` com todas as transições da partida. Os
   componentes em `src/components/` são de apresentação.

`components/Partida.tsx` é dono do ciclo de vida de uma partida (rende `QuizScreen` ou
`ResultScreen`); o `App` o remonta via `key` para começar outra, e é assim que o estado
da anterior não vaza.

### Armadilhas reais deste código

- **Ordem de escrita.** `game_results.device_id` tem FK para `players`, então o perfil
  precisa existir antes do insert do resultado. Use `persistirPartida()`, que faz
  perfil→resultado na ordem certa; `saveResult()` sozinho falha para um jogador novo.
- **A fila de reenvio marca o que falta** (`needProfile` / `needResult`). Sem isso, um
  reenvio somaria XP duas vezes quando só o insert do resultado havia falhado.
- **`useQuiz` persiste sob um `useRef`** porque o StrictMode do React 18 executa
  efeitos duas vezes em desenvolvimento — sem o guard, cada partida gravaria duas vezes.
- **O timeout é resolvido dentro do reducer** (`TICK` com tempo ≤ 0 registra a resposta),
  não por um dispatch extra do efeito. Isso evita corrida entre o tick e o clique.
- **Embaralhar alternativas recalcula `correctIndex` no mesmo passo** — separar as duas
  operações é o jeito clássico de quebrar o gabarito. Verdadeiro/Falso não é embaralhado.
- **`localStorage` é sempre acessado via `lib/storage.ts`**, que engole exceções: em modo
  privado o próprio getter lança, e o jogo não pode cair por isso.

### Dados

`supabase/schema.sql` e `supabase/seed.sql` são versionados, idempotentes e aplicados à
mão no SQL Editor — não há migrations automatizadas. Adicionar pergunta é inserir linha
em `questions`, **nunca** mudar código (RNF05).

O campo `topic` das perguntas é semântico: `badges.ts` procura "JOIN" nele para a badge
Mestre do JOIN. Mantenha consistente ao adicionar perguntas.

As policies de escrita estão abertas para `anon` porque o MVP não tem auth (PRD §6.7,
nota de segurança) — decisão consciente para uso interno. Não "corrija" isso sem migrar
para Supabase Auth, que é item de roadmap.

`localStorage` guarda apenas apoio (chaves em `lib/storage.ts`): `device_id`, apelido,
último resultado, cache de perguntas e fila de pendências. A verdade está no Postgres.
O `device_id` (UUID gerado uma vez) é a PK de `players` e a FK de `game_results` — é o
que liga XP e badges entre partidas, sem login.

## Decisões onde o PRD era omisso

Se o usuário questionar algum destes comportamentos, é aqui que a escolha foi feita —
não são bugs:

- `xpEarned = score` da partida (o PRD define as faixas em §3.3, mas não a conversão).
- Badge Velocista conta 5 respostas **corretas** com menos de 5s cada.
- Badge Mestre do JOIN exige que a partida tenha tido ao menos uma pergunta de JOIN.
- Sem sistema de vidas (PRD §3.5 marca como opcional).
- Sem `react-router`: navegação é máquina de estados. O `vercel.json` com rewrite de SPA
  entra de todo modo, conforme §6.9.
- Tailwind 4 via `@tailwindcss/vite` (o PRD sugeria a rota PostCSS, que é a da v3).

## Contradições conhecidas no PRD

O PRD é v1.0 e tem resquícios de uma versão anterior 100% client-side. **Supabase
vence** (§2.3, §6, e os critérios de aceite de §7 exigem leitura/escrita no Supabase).
Trate como obsoletos: RF01 ("carregar de arquivo JSON"), RF08/RF09 ("persistir ranking
no `localStorage`") e §8 ("MVP 100% client-side, sem dependência de backend"). Em
qualquer outro conflito, prefira §6 e §7.
