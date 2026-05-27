/**
 * Dentistas — /dashboard/dentistas
 * Acesso: somente admin
 */
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { createClient } from '@/services/supabase/server'
import { ROUTES } from '@/config/routes'
import { DentistasPageClient } from '@/features/dentistas/components/DentistasPageClient'

export const metadata: Metadata = {
  title: 'Dentistas | OdontoSystem',
}

export default async function DentistasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.auth.login)

  // Busca papel e clínica do usuário
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: perfil } = await (supabase as any)
    .from('perfis')
    .select('role, clinica_id')
    .eq('id', user.id)
    .single() as { data: { role: string; clinica_id: string | null } | null }

  // Apenas admin pode acessar
  if (perfil?.role !== 'admin') redirect(ROUTES.dashboard.home)

  // Admin sem clínica vinculada → redireciona
  if (!perfil?.clinica_id) redirect(ROUTES.dashboard.home)

  return <DentistasPageClient clinicaId={perfil.clinica_id} />
}
