/**
 * Agenda — /dashboard/agenda
 * Visível para todos os usuários da clínica
 */
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { createClient } from '@/services/supabase/server'
import { ROUTES } from '@/config/routes'
import { AgendaPageClient } from '@/features/agenda/components/AgendaPageClient'

export const metadata: Metadata = {
  title: 'Agenda | OdontoSystem',
}

export default async function AgendaPage() {
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

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visualize e gerencie os agendamentos da clínica
        </p>
      </div>
      <AgendaPageClient clinicaId={perfil.clinica_id} />
    </div>
  )
}
