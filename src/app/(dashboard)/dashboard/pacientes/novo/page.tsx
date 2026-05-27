/**
 * Novo Paciente — /dashboard/pacientes/novo
 */
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { createClient } from '@/services/supabase/server'
import { ROUTES } from '@/config/routes'
import { PacienteForm } from '@/features/pacientes/components/PacienteForm'

export const metadata: Metadata = {
  title: 'Novo Paciente | OdontoSystem',
}

export default async function NovoPacientePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(ROUTES.auth.login)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: perfil } = await (supabase as any)
    .from('perfis')
    .select('clinica_id')
    .eq('id', user.id)
    .single() as { data: { clinica_id: string | null } | null }

  if (!perfil?.clinica_id) redirect(ROUTES.dashboard.home)

  return <PacienteForm clinicaId={perfil.clinica_id} />
}
