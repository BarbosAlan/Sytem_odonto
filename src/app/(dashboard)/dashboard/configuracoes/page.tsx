/**
 * Configurações da Clínica — /dashboard/configuracoes
 * Acesso: somente admin
 */
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { createClient } from '@/services/supabase/server'
import { ROUTES } from '@/config/routes'
import { ClinicaSettings } from '@/features/clinica/components/ClinicaSettings'
import type { ClinicaData, Endereco, Configuracoes } from '@/features/clinica/types/clinica.types'

export const metadata: Metadata = {
  title: 'Configurações | OdontoSystem',
}

export default async function ConfiguracoesPage() {
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

  // Busca dados da clínica
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: clinicaRaw } = await (supabase as any)
    .from('clinica')
    .select('*')
    .eq('id', perfil.clinica_id)
    .single()

  if (!clinicaRaw) redirect(ROUTES.dashboard.home)

  // Normaliza os campos JSONB para tipos tipados
  const clinica: ClinicaData = {
    id: clinicaRaw.id,
    nome: clinicaRaw.nome,
    cnpj: clinicaRaw.cnpj ?? null,
    telefone: clinicaRaw.telefone ?? null,
    email: clinicaRaw.email ?? null,
    logo_url: clinicaRaw.logo_url ?? null,
    created_at: clinicaRaw.created_at,
    updated_at: clinicaRaw.updated_at,
    endereco: ((clinicaRaw.endereco ?? {}) as Endereco),
    configuracoes: ((clinicaRaw.configuracoes ?? {}) as Configuracoes),
  }

  return (
    <ClinicaSettings
      clinicaId={perfil.clinica_id}
      initialData={clinica}
    />
  )
}
