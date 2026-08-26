// Cliente Supabase. Nenhum componente deve importar este arquivo direto —
// todo acesso a dados passa por src/lib/api.ts.
//
// Somente a anon key aparece aqui: o Vite injeta tudo que começa com VITE_
// no bundle do cliente, então a service_role nunca pode entrar. A proteção
// real vem do RLS definido em supabase/schema.sql.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * null quando as variáveis de ambiente não estão definidas. O app precisa
 * continuar carregando nesse caso (RNF04) — api.ts trata o null e cai para
 * o cache local, em vez de estourar na importação e deixar a tela branca.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: false },
    })
  : null

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[quiz] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes. ' +
      'Copie .env.example para .env e preencha com os dados de ' +
      'Supabase → Project Settings → API.',
  )
}
