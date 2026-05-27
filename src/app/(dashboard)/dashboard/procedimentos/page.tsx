/**
 * Procedimentos — /dashboard/procedimentos
 * Acesso: somente admin
 */
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { createClient } from '@/services/supabase/server'
import { ROUTES } from '@/config/routes'
import { ProcedimentosPageClient } from '@/features/procedimentos/components/ProcedimentosPageClient'

export const metadata: Metadata = {
  title: 'Procedimentos | OdontoSystem',
}

export default async function ProcedimentosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.auth.login)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: perfil } = await (supabase as any)
    .from('perfis')
    .select('role, clinica_id')
    .eq('id', user.id)
    .single() as { data: { role: string; clinica_id: string | null } | null }

  if (perfil?.role !== 'admin') redirect(ROUTES.dashboard.home)
  if (!perfil?.clinica_id) redirect(ROUTES.dashboard.home)

  return <ProcedimentosPageClient clinicaId={perfil.clinica_id} />
}
