# PRD — Quiz Web de SQL Server (Nível Básico) com Gamificação

> **Documento de Requisitos de Produto**
> Versão: 1.0 · Data: 2026-08-25 · Autor: thiago.ramalho@kevseguros.com.br
> Este PRD será consumido pelo Claude Code para construir o projeto do zero.

---

## 1. Visão Geral

Aplicação web de **quiz educativo sobre SQL Server em nível básico**, com **gamificação** e
**sistema de pontuação escalonado por dificuldade**. O objetivo é tornar o aprendizado de
fundamentos de banco de dados envolvente, com feedback imediato, recompensas e ranking.

### 1.1 Problema
Iniciantes em SQL abandonam materiais teóricos por falta de engajamento e feedback rápido.

### 1.2 Solução
Um quiz interativo que combina perguntas objetivas, correção instantânea e mecânicas de jogo
(pontos, streaks, badges, ranking) para incentivar prática repetida.

### 1.3 Proposta de valor
- Aprendizado leve e divertido dos fundamentos de SQL Server.
- Feedback imediato com explicação de cada resposta.
- Engajamento sustentado por pontuação, conquistas e ranking.

---

## 2. Requisitos de Negócio

### 2.1 Público-alvo
- Iniciantes em banco de dados e SQL.
- Analistas, estagiários e times internos em treinamento (ex.: INVESTPREV/Kev Seguros).

### 2.2 Objetivos / Métricas de sucesso
| Objetivo | Métrica |
|----------|---------|
| Engajamento | Nº de partidas concluídas por usuário |
| Aprendizado | % de acertos crescente entre partidas |
| Retenção | Taxa de "jogar novamente" |
| Cobertura | % das perguntas do banco vistas pelo usuário |

### 2.3 Escopo (MVP)
**Incluído:**
- Banco de perguntas de SQL Server nível básico (mín. 20 perguntas), **armazenado no Supabase**.
- Perguntas de múltipla escolha e verdadeiro/falso.
- Pontuação escalonada por dificuldade + bônus de tempo + streak.
- Timer por pergunta.
- Tela de resultado com resumo e medalhas.
- **Ranking global online (Supabase)** — identificação por apelido, sem login.
- **Perfil/XP do jogador persistido no Supabase.**
- Sistema de badges/conquistas.

**Fora do escopo (MVP):**
- Autenticação com senha/conta (usa apenas apelido + device id).
- Multiplayer em tempo real.
- Painel administrativo com UI para cadastrar perguntas (perguntas são inseridas via SQL/seed).
- Perguntas de "completar a query" (texto livre).

### 2.4 Roadmap futuro (pós-MVP)
- Supabase Auth (login real por e-mail/magic link) para ranking anti-fraude.
- Painel administrativo (CRUD de perguntas) protegido por role.
- Modos de jogo adicionais (contra o tempo, sobrevivência).
- Níveis intermediário e avançado.
- Perguntas com editor de SQL e validação de query.
- Realtime leaderboard (Supabase Realtime).

---

## 3. Mecânica de Gamificação e Pontuação

### 3.1 Pontuação por nível de dificuldade
Cada pergunta tem um nível de dificuldade (dentro do "básico") que define os pontos base:

| Nível | Peso base (pontos) | Exemplos de conteúdo |
|-------|-------------------|----------------------|
| 🟢 Fácil | **10** | `SELECT`, `WHERE`, `FROM`, tipos de dados, aliases |
| 🟡 Médio | **20** | `ORDER BY`, `GROUP BY`, `DISTINCT`, `JOIN` simples, `LIKE` |
| 🔴 Difícil | **30** | `HAVING`, subquery simples, funções de agregação (`COUNT`, `SUM`, `AVG`) |

### 3.2 Modificadores de pontuação
- **Bônus de tempo:** resposta correta rápida ganha extra.
  - Fórmula sugerida: `bonus = round(pontosBase * 0.5 * (tempoRestante / tempoTotal))`.
- **Streak (combo):** acertos consecutivos aplicam multiplicador crescente.
  - Ex.: 3 acertos → x1.2; 5 acertos → x1.5; 8+ acertos → x2.0.
  - Um erro **zera** o streak.
- **Penalidade por dica (opcional):** usar dica reduz 50% dos pontos daquela pergunta.

**Cálculo final por pergunta (correta):**
```
pontosPergunta = round((pontosBase + bonusTempo) * multiplicadorStreak * (dicaUsada ? 0.5 : 1))
```
Resposta errada = 0 pontos + streak zerado.

### 3.3 Sistema de XP e níveis do jogador
XP acumulada define a faixa do jogador:

| Faixa | XP necessária |
|-------|---------------|
| Aprendiz | 0 |
| Analista Jr | 300 |
| Analista | 800 |
| DBA Jr | 1500 |

### 3.4 Conquistas / Badges
| Badge | Condição |
|-------|----------|
| 🎯 Perfeição | Partida sem erros |
| ⚡ Velocista | 5 respostas em menos de 5s cada |
| 🔥 Em chamas | Streak de 8 acertos |
| 🧠 Mestre do JOIN | Acertar todas as perguntas de JOIN |
| 🏆 Centurião | Somar 500+ pontos numa partida |

### 3.5 Regras de jogo
- Timer padrão por pergunta: **20 segundos** (configurável).
- Vidas: opcional (MVP pode não ter; se tiver, 3 vidas por partida).
- Ao expirar o tempo: conta como erro (0 pts, zera streak).
- Feedback imediato após cada resposta, com explicação da correta.

---

## 4. Requisitos Funcionais

### 4.1 Fluxo principal
1. **Tela inicial:** título, botão "Jogar", acesso ao ranking e às regras.
2. **Configuração da partida:** escolher dificuldade (Todas / Fácil / Médio / Difícil) e quantidade de perguntas.
3. **Partida:**
   - Exibe pergunta, alternativas, timer e placar ao vivo (pontos + streak).
   - Ao responder: destaca certa/errada, mostra explicação, soma pontos.
   - Botão "Próxima" avança.
4. **Resultado final:** total de pontos, nº de acertos, tempo total, badges conquistadas, XP ganha, faixa atual.
5. **Ranking:** lista das melhores pontuações locais (nome + pontos).
6. **Rejogar:** reinicia o fluxo.

### 4.2 Funcionalidades detalhadas
- **RF01** — Carregar banco de perguntas a partir de arquivo JSON.
- **RF02** — Embaralhar perguntas e alternativas a cada partida.
- **RF03** — Filtrar perguntas por dificuldade selecionada.
- **RF04** — Cronometrar cada pergunta e encerrá-la ao esgotar o tempo.
- **RF05** — Calcular pontuação com base + bônus de tempo + streak + penalidade de dica.
- **RF06** — Exibir feedback e explicação após cada resposta.
- **RF07** — Registrar e exibir badges conquistadas na partida.
- **RF08** — Persistir pontuações, ranking e melhor faixa no `localStorage`.
- **RF09** — Exibir ranking local ordenado por pontos.
- **RF10** — Permitir informar/apelido do jogador para o ranking.
- **RF11** — Barra de progresso da partida (pergunta X de N).

---

## 5. Requisitos Não Funcionais

- **RNF01 — Usabilidade:** interface responsiva (desktop e mobile), navegação simples.
- **RNF02 — Desempenho:** carregamento inicial < 2s; transições fluidas.
- **RNF03 — Acessibilidade:** contraste adequado, foco por teclado, textos legíveis.
- **RNF04 — Resiliência de rede:** exibir estados de carregamento e erro em chamadas ao Supabase; se o ranking/perfil falhar, permitir jogar mesmo assim (degradação graciosa com cache local).
- **RNF05 — Manutenibilidade:** perguntas em tabela no Supabase, editáveis via SQL sem alterar código.
- **RNF08 — Segurança de dados:** usar apenas a `anon key` no cliente; nunca expor `service_role`; proteger tabelas com RLS.
- **RNF06 — Portabilidade:** rodar em navegadores modernos (Chrome, Edge, Firefox).
- **RNF07 — Feedback visual:** animações de acerto/erro; som opcional com toggle.

---

## 6. Especificação Técnica

### 6.1 Stack recomendada
- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Estilização:** Tailwind CSS
- **Estado:** React hooks / Context API (ou Zustand se necessário)
- **Backend / Dados:** **Supabase** (Postgres + REST/JS SDK)
  - Perguntas, ranking (resultados) e perfil/XP em tabelas Postgres.
  - Cliente usa `@supabase/supabase-js` com a **anon key** (RLS ativa).
- **Identificação:** apelido + `device_id` (UUID gerado no cliente e guardado em `localStorage`) — **sem login**.
- **Cache local:** `localStorage` apenas para `device_id`, apelido e fallback offline.
- **Hospedagem:** **Vercel** (frontend) + projeto **Supabase** gerenciado (backend/dados).

**Variáveis de ambiente (`.env`):**
```
VITE_SUPABASE_URL=<url-do-projeto>
VITE_SUPABASE_ANON_KEY=<anon-key>
```
> ⚠️ Nunca commitar a `service_role key`. No cliente, só a `anon key`.

### 6.2 Estrutura de pastas sugerida
```
quiz-sqlserver/
├── supabase/
│   ├── schema.sql           # criação de tabelas + RLS + policies
│   └── seed.sql             # perguntas iniciais (mín. 20)
├── src/
│   ├── components/
│   │   ├── StartScreen.tsx
│   │   ├── QuizScreen.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── Timer.tsx
│   │   ├── ScoreBoard.tsx
│   │   ├── ResultScreen.tsx
│   │   ├── Leaderboard.tsx
│   │   └── BadgeList.tsx
│   ├── hooks/
│   │   ├── useQuiz.ts
│   │   └── useLocalStorage.ts
│   ├── lib/
│   │   ├── supabaseClient.ts # inicializa o cliente Supabase
│   │   ├── api.ts            # queries: getQuestions, saveResult, getLeaderboard, upsertProfile
│   │   ├── scoring.ts        # cálculo de pontos, bônus, streak
│   │   ├── badges.ts         # regras de conquistas
│   │   └── device.ts         # gera/recupera device_id (localStorage)
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── vercel.json             # rewrites SPA para deploy na Vercel
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

### 6.3 Modelo de dados

**Pergunta (`Question`):**
```json
{
  "id": "q001",
  "difficulty": "facil",
  "topic": "SELECT",
  "type": "multiple_choice",
  "question": "Qual comando é usado para recuperar dados de uma tabela no SQL Server?",
  "options": ["SELECT", "GET", "FETCH", "PULL"],
  "correctIndex": 0,
  "explanation": "O comando SELECT é usado para consultar/recuperar dados de uma ou mais tabelas.",
  "hint": "É a palavra-chave mais comum em consultas."
}
```

**Tipos TypeScript (referência):**
```typescript
type Difficulty = "facil" | "medio" | "dificil";
type QuestionType = "multiple_choice" | "true_false";

interface Question {
  id: string;
  difficulty: Difficulty;
  topic: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

interface GameResult {
  playerName: string;
  score: number;
  correct: number;
  total: number;
  timeSpentSec: number;
  badges: string[];
  xpEarned: number;
  date: string; // ISO
}

interface ScoreConfig {
  basePoints: Record<Difficulty, number>; // { facil:10, medio:20, dificil:30 }
  timePerQuestionSec: number;             // 20
  timeBonusFactor: number;                // 0.5
  streakThresholds: { streak: number; multiplier: number }[];
  hintPenalty: number;                    // 0.5
}
```

### 6.4 Regras de pontuação (implementação — `scoring.ts`)
```
função calcularPontos(pergunta, tempoRestante, tempoTotal, streakAtual, dicaUsada):
    base = basePoints[pergunta.difficulty]
    bonusTempo = round(base * timeBonusFactor * (tempoRestante / tempoTotal))
    mult = multiplicadorPorStreak(streakAtual)   // ver streakThresholds
    fatorDica = dicaUsada ? (1 - hintPenalty) : 1
    retorna round((base + bonusTempo) * mult * fatorDica)
```

### 6.5 Persistência (Supabase + cache local)
**No Supabase (Postgres):**
- Perguntas: tabela `questions` (lida no início da partida).
- Resultados/ranking: tabela `game_results` (insert ao fim da partida; leitura ordenada por `score`).
- Perfil/XP: tabela `players` (upsert por `device_id`).

**No `localStorage` (apenas apoio):**
- `quiz_sqlserver_device_id`: UUID do dispositivo (gerado uma vez).
- `quiz_sqlserver_nickname`: último apelido usado.
- `quiz_sqlserver_last_result`: cache do último resultado (fallback se o Supabase estiver indisponível).

**Regras:**
- Toda chamada ao Supabase deve tratar erro (try/catch) e expor estado de loading/erro na UI.
- Se o insert do resultado falhar, guardar em `localStorage` e tentar reenviar depois (fila simples).

### 6.6 Camada de acesso a dados (`api.ts`)
Funções esperadas:
- `getQuestions(difficulty?, limit)` → `Question[]` (embaralhar no cliente).
- `saveResult(result: GameResult)` → insere em `game_results`.
- `getLeaderboard(limit = 20)` → melhores `game_results` ordenados por `score` desc.
- `upsertProfile(deviceId, nickname, xpDelta, badges)` → atualiza `players`.
- `getProfile(deviceId)` → perfil atual (XP, faixa, badges).

### 6.7 Schema do Supabase (`schema.sql`)
```sql
-- Perguntas
create table if not exists questions (
  id          text primary key,
  difficulty  text not null check (difficulty in ('facil','medio','dificil')),
  topic       text not null,
  type        text not null check (type in ('multiple_choice','true_false')),
  question    text not null,
  options     jsonb not null,          -- array de strings
  correct_index int not null,
  explanation text not null,
  hint        text,
  created_at  timestamptz default now()
);

-- Perfil do jogador (sem login; chave = device_id)
create table if not exists players (
  device_id   uuid primary key,
  nickname    text not null,
  total_xp    int not null default 0,
  faixa       text not null default 'Aprendiz',
  badges      jsonb not null default '[]',
  updated_at  timestamptz default now()
);

-- Resultados / ranking
create table if not exists game_results (
  id            bigint generated always as identity primary key,
  device_id     uuid references players(device_id),
  player_name   text not null,
  score         int not null,
  correct       int not null,
  total         int not null,
  time_spent_sec int not null,
  badges        jsonb not null default '[]',
  xp_earned     int not null default 0,
  created_at    timestamptz default now()
);

create index if not exists idx_game_results_score on game_results (score desc);

-- RLS
alter table questions    enable row level security;
alter table players      enable row level security;
alter table game_results enable row level security;

-- Perguntas: leitura pública, sem escrita pelo cliente
create policy "questions_read" on questions for select using (true);

-- Players: leitura e escrita liberadas para anon (MVP sem auth)
create policy "players_read"   on players for select using (true);
create policy "players_write"  on players for insert with check (true);
create policy "players_update" on players for update using (true) with check (true);

-- Resultados: leitura pública + insert liberado (MVP)
create policy "results_read"   on game_results for select using (true);
create policy "results_insert" on game_results for insert with check (true);
```
> **Nota de segurança (MVP):** como não há login, as policies de escrita são abertas para `anon`.
> Isso é aceitável para uso interno/educativo. Para produção pública, migrar para Supabase Auth
> (roadmap) e restringir escrita ao próprio usuário; considerar validar `score` via função/Edge Function.

### 6.8 Banco de perguntas inicial (temas obrigatórios)
Mínimo de 20 perguntas cobrindo:
- **Fácil:** `SELECT`, `FROM`, `WHERE`, aliases (`AS`), tipos de dados, `TOP`.
- **Médio:** `ORDER BY`, `DISTINCT`, `GROUP BY`, `LIKE`, `IN`, `BETWEEN`, `INNER JOIN`.
- **Difícil:** `HAVING`, `COUNT/SUM/AVG/MAX/MIN`, subquery simples, `LEFT JOIN`.

---

### 6.9 Deploy na Vercel
**Configuração do build (Vite):**
| Item | Valor |
|------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node Version | 20.x |

**Variáveis de ambiente (Vercel → Project Settings → Environment Variables):**
- `VITE_SUPABASE_URL` = URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` = anon key do Supabase

> Definir para os ambientes **Production**, **Preview** e **Development**.
> Como o Vite injeta variáveis `VITE_*` no bundle do cliente, use **somente a anon key** (nunca `service_role`).

**SPA rewrite (`vercel.json`)** — garante que rotas do client-side não retornem 404:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Fluxo de deploy:**
1. Push do repositório para o GitHub/GitLab.
2. Importar o projeto na Vercel (detecta Vite automaticamente).
3. Configurar as variáveis de ambiente acima.
4. Deploy automático a cada push na branch principal; *Preview Deploys* em PRs.

**CORS/Supabase:** adicionar o domínio da Vercel (produção e previews `*.vercel.app`) em
Supabase → Authentication → URL Configuration (Site URL / redirect), caso venha a usar Auth no futuro.
Para o MVP (anon key + REST), não há bloqueio de CORS adicional.

## 7. Critérios de Aceite

- [ ] O usuário consegue iniciar e concluir uma partida completa.
- [ ] Perguntas fáceis valem 10, médias 20 e difíceis 30 pontos base.
- [ ] Bônus de tempo é aplicado corretamente em respostas rápidas.
- [ ] Streak multiplica pontos e é zerado ao errar.
- [ ] Timer encerra a pergunta ao esgotar e conta como erro.
- [ ] Após cada resposta, aparece feedback com a explicação.
- [ ] Tela de resultado mostra pontos, acertos, tempo, badges e XP.
- [ ] Perguntas são carregadas do Supabase no início da partida.
- [ ] Resultado da partida é gravado em `game_results` no Supabase.
- [ ] Ranking global lê os melhores resultados do Supabase, ordenados por score.
- [ ] Perfil/XP do jogador é persistido (upsert por `device_id`) no Supabase.
- [ ] App não trava se o Supabase falhar (estados de loading/erro e fallback).
- [ ] Ao menos 5 badges implementadas e desbloqueáveis.
- [ ] Interface responsiva em desktop e mobile.
- [ ] Banco com no mínimo 20 perguntas válidas de SQL Server básico (via `seed.sql`).
- [ ] Projeto builda com `npm run build` e faz deploy na Vercel com as env vars configuradas.

---

## 8. Considerações Finais
- Priorizar simplicidade: MVP 100% client-side, sem dependência de backend.
- Manter perguntas em JSON para facilitar expansão sem alterar código.
- Código organizado, tipado e comentado para evolução futura (backend, ranking global).
