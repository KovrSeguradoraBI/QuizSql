# Quiz SQL Server — nível básico com gamificação

Quiz web educativo sobre fundamentos de SQL Server, com pontuação escalonada por
dificuldade, bônus de tempo, combo (streak), conquistas, XP/faixas e ranking global.

Especificação completa em [`prd.md`](./prd.md). Guia para o Claude Code em
[`CLAUDE.md`](./CLAUDE.md).

**Stack:** React 18 + TypeScript · Vite · Tailwind CSS 4 · Supabase (Postgres) · Vercel

---

## Como rodar

Requisito: Node 20 ou superior.

```bash
npm install
cp .env.example .env     # e preencha as duas variáveis (ver abaixo)
npm run dev
```

| Comando           | O que faz                                      |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento (Vite)             |
| `npm run build`   | Typecheck + build de produção em `dist/`       |
| `npm run preview` | Serve o `dist/` para conferir o build          |
| `npm run lint`    | Só o typecheck do TypeScript                   |

### Variáveis de ambiente

Em **Supabase → Project Settings → API**, copie *Project URL* e a chave
**`anon` / `public`**:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

> O Vite injeta tudo que começa com `VITE_` no bundle do cliente. Use **somente a
> anon key** — a `service_role` nunca entra no front-end. A proteção real vem do
> RLS em `supabase/schema.sql`.

Sem essas variáveis o app ainda abre, mas avisa que o Supabase não está
configurado e não consegue carregar perguntas na primeira execução.

## Banco de dados

Aplique no **SQL Editor** do Supabase, nesta ordem:

1. `supabase/schema.sql` — tabelas, índice e políticas de RLS
2. `supabase/seed.sql` — 25 perguntas (8 fáceis, 9 médias, 8 difíceis)

Os dois são idempotentes e podem ser reexecutados. Para adicionar perguntas, basta
inserir linhas em `questions` — nenhuma mudança de código é necessária.

> **Segurança (MVP):** não há login, então as políticas de escrita estão abertas
> para o papel `anon`. É aceitável para uso interno/educativo. Para uso público,
> migre para Supabase Auth e valide o `score` no servidor.

## Como o código está organizado

```
src/
├── types/index.ts        tipos de domínio (camelCase)
├── lib/
│   ├── supabaseClient.ts cliente Supabase (não importe direto nos componentes)
│   ├── api.ts            única porta de dados: mapeia snake_case, embaralha, resiliência
│   ├── scoring.ts        pontuação, combo, XP e faixas (lógica pura)
│   ├── badges.ts         regras das conquistas (lógica pura)
│   ├── device.ts         device_id (UUID em localStorage) = identidade sem login
│   └── storage.ts        acesso protegido ao localStorage
├── hooks/useQuiz.ts      máquina de estados da partida (timer, streak, fechamento)
├── components/           telas e componentes de apresentação
└── App.tsx               máquina de estados das telas
supabase/                 schema.sql e seed.sql
```

Duas ideias sustentam o resto:

- **`api.ts` é a única fronteira com o backend.** Ele traduz o `snake_case` do
  Postgres para o `camelCase` do domínio, embaralha perguntas e alternativas, e
  concentra a resiliência de rede.
- **O jogo continua se o Supabase cair.** As perguntas ficam em cache no
  `localStorage` depois da primeira carga, e uma partida que não conseguiu ser
  enviada entra numa fila reenviada na próxima abertura do app.

O `device_id` (UUID gerado uma vez no cliente) é a chave de `players` e a FK de
`game_results` — é o que liga XP e conquistas entre partidas, sem login.

## Pontuação

```
bônus de tempo = round(base * 0,5 * tempoRestante / tempoTotal)
pontos         = round((base + bônus) * multiplicadorDeCombo * (dica ? 0,5 : 1))
```

| Dificuldade | Base   |
| ----------- | ------ |
| 🟢 Fácil    | 10 pts |
| 🟡 Médio    | 20 pts |
| 🔴 Difícil  | 30 pts |

Combo: 3 acertos → ×1,2 · 5 → ×1,5 · 8+ → ×2,0. Errar ou deixar o tempo esgotar
vale 0 pontos e zera o combo. Timer de 20s por pergunta.

Faixas por XP acumulada: Aprendiz (0) · Analista Jr (300) · Analista (800) ·
DBA Jr (1500). A XP ganha na partida é igual à pontuação.

## Deploy na Vercel

1. Faça push do repositório para o GitHub.
2. Importe o projeto na Vercel — o preset Vite é detectado (build `npm run build`,
   saída `dist`).
3. Cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em **Production**,
   **Preview** e **Development**.

O `vercel.json` já traz o rewrite de SPA para que rotas de cliente não retornem 404.
