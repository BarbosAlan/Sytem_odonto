/**
 * Editar Paciente — /dashboard/pacientes/[id]/editar
 */
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { createClient } from '@/services/supabase/server'
import { ROUTES } from '@/config/routes'
import { PacienteForm } from '@/features/pacientes/components/PacienteForm'
import type { PacienteData, PacienteEndereco } from '@/features/pacientes/types/paciente.types'

export const metadata: Metadata = {
  title: 'Editar Paciente | OdontoSystem',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarPacientePage({ params }: Props) {
  const { id } = await params

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

  // Busca paciente
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: raw } = await (supabase as any)
    .from('pacientes')
    .select('*')
    .eq('id', id)
    .eq('clinica_id', perfil.clinica_id)
    .single() as { data: Record<string, unknown> | null }

  if (!raw) notFound()

  const paciente: PacienteData = {
    id: raw.id as string,
    clinica_id: raw.clinica_id as string,
    nome: raw.nome as string,
    cpf: (raw.cpf as string | null) ?? null,
    data_nascimento: (raw.data_nascimento as string | null) ?? null,
    sexo: (raw.sexo as 'M' | 'F' | 'O' | null) ?? null,
    estado_civil: (raw.estado_civil as string | null) ?? null,
    profissao: (raw.profissao as string | null) ?? null,
    telefone: (raw.telefone as string | null) ?? null,
    email: (raw.email as string | null) ?? null,
    nome_emergencia: (raw.nome_emergencia as string | null) ?? null,
    telefone_emergencia: (raw.telefone_emergencia as string | null) ?? null,
    endereco: ((raw.endereco ?? {}) as PacienteEndereco),
    convenio: (raw.convenio as string | null) ?? null,
    numero_convenio: (raw.numero_convenio as string | null) ?? null,
    observacoes: (raw.observacoes as string | null) ?? null,
    ativo: raw.ativo as boolean,
    created_at: raw.created_at as string,
    updated_at: raw.updated_at as string,
  }

  return <PacienteForm clinicaId={perfil.clinica_id} initialData={paciente} />
}
