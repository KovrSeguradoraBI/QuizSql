-- =====================================================================
-- Quiz SQL Server - schema (PRD secao 6.7)
-- Aplicar no Supabase: SQL Editor -> colar -> Run
-- =====================================================================

-- Perguntas
create table if not exists questions (
  id            text primary key,
  difficulty    text not null check (difficulty in ('facil','medio','dificil')),
  topic         text not null,
  type          text not null check (type in ('multiple_choice','true_false')),
  question      text not null,
  options       jsonb not null,          -- array de strings
  correct_index int not null,
  explanation   text not null,
  hint          text,
  created_at    timestamptz default now()
);

-- Perfil do jogador (sem login; chave = device_id gerado no cliente)
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
  id             bigint generated always as identity primary key,
  device_id      uuid references players(device_id),
  player_name    text not null,
  score          int not null,
  correct        int not null,
  total          int not null,
  time_spent_sec int not null,
  badges         jsonb not null default '[]',
  xp_earned      int not null default 0,
  created_at     timestamptz default now()
);

create index if not exists idx_game_results_score on game_results (score desc);

-- =====================================================================
-- RLS
-- NOTA DE SEGURANCA (PRD 6.7): como o MVP nao tem login, as policies de
-- escrita ficam abertas para o papel anon. E aceitavel para uso interno/
-- educativo. Para producao publica: migrar para Supabase Auth (roadmap),
-- restringir escrita ao proprio usuario e validar score em Edge Function.
-- =====================================================================
alter table questions    enable row level security;
alter table players      enable row level security;
alter table game_results enable row level security;

-- Perguntas: leitura publica, sem escrita pelo cliente
drop policy if exists "questions_read" on questions;
create policy "questions_read" on questions for select using (true);

-- Players: leitura e escrita liberadas para anon (MVP sem auth)
drop policy if exists "players_read"   on players;
drop policy if exists "players_write"  on players;
drop policy if exists "players_update" on players;
create policy "players_read"   on players for select using (true);
create policy "players_write"  on players for insert with check (true);
create policy "players_update" on players for update using (true) with check (true);

-- Resultados: leitura publica + insert liberado (MVP)
drop policy if exists "results_read"   on game_results;
drop policy if exists "results_insert" on game_results;
create policy "results_read"   on game_results for select using (true);
create policy "results_insert" on game_results for insert with check (true);
