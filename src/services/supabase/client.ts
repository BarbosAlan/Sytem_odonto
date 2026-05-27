/**
 * Supabase Browser Client
 *
 * Use this client in Client Components ('use client').
 * Instância singleton para evitar múltiplas conexões.
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
