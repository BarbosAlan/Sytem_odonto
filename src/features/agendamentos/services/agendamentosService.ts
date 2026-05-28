/**
 * agendamentosService — listagem com filtros, edição e exclusão de agendamentos
 */

import { createClient as createBrowserClient } from '@/services/supabase/client'
import type {
  AgendamentoComDetalhes,
  AgendamentoInsert,
  AgendamentoStatus,
} from '@/features/agenda/types/agenda.types'
import type { FiltrosAgendamentos } from '../types/agendamentos.types'

function getClient() {
  return createBrowserClient()
}

// Monta o query com os filtros aplicados (reutilizado em listar e exportar)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildQuery(supabase: any, clinicaId: string, filtros: FiltrosAgendamentos, pacienteIds: string[] | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase as any)
    .from('agendamentos')
    .eq('clinica_id', clinicaId)
    .order('data_hora', { ascending: false })

  if (filtros.dataInicio) q = q.gte('data_hora', `${filtros.dataInicio}T00:00:00`)
  if (filtros.dataFim)    q = q.lte('data_hora', `${filtros.dataFim}T23:59:59`)
  if (filtros.dentistaId) q = q.eq('dentista_id', filtros.dentistaId)
  if (filtros.status)     q = q.eq('status', filtros.status)
  if (pacienteIds !== null) q = q.in('paciente_id', pacienteIds)

  return q
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): AgendamentoComDetalhes {
  return {
    ...row,
    paciente_nome: row.pacientes?.nome ?? null,
    paciente_cpf: row.pacientes?.cpf ?? null,
    dentista_nome: row.dentistas?.nome ?? '',
    dentista_cor: row.dentistas?.cor ?? '#6B7280',
    procedimento_nome: row.procedimentos?.nome ?? null,
  }
}

async function resolverPacienteIds(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  clinicaId: string,
  pacienteNome: string
): Promise<string[] | null> {
  if (pacienteNome.trim().length < 2) return null

  const { data: pacs } = await (supabase as any)
    .from('pacientes')
    .select('id')
    .eq('clinica_id', clinicaId)
    .ilike('nome', `%${pacienteNome.trim()}%`)
    .limit(200) as { data: { id: string }[] | null }

  return (pacs ?? []).map((p) => p.id)
}

export const agendamentosService = {
  /**
   * Lista agendamentos com filtros e paginação.
   * O filtro por pacienteNome usa pré-consulta pois Supabase não
   * suporta ilike em colunas de relações diretamente.
   */
  async listarComFiltros(
    clinicaId: string,
    filtros: FiltrosAgendamentos,
    pagina: number,
    porPagina: number
  ): Promise<{ data: AgendamentoComDetalhes[]; total: number }> {
    const supabase = getClient()
    const offset = (pagina - 1) * porPagina

    const pacienteIds = await resolverPacienteIds(supabase, clinicaId, filtros.pacienteNome)
    if (pacienteIds !== null && pacienteIds.length === 0) return { data: [], total: 0 }

    const query = buildQuery(supabase, clinicaId, filtros, pacienteIds)
      .select('*, pacientes (nome, cpf), dentistas (nome, cor), procedimentos (nome)', { count: 'exact' })
      .range(offset, offset + porPagina - 1)

    const { data, error, count } = await query as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any[] | null
      error: unknown
      count: number | null
    }

    if (error) throw error

    return {
      data: (data ?? []).map(mapRow),
      total: count ?? 0,
    }
  },

  /** Busca todos os registros (sem paginação) para exportação CSV */
  async exportarTodos(
    clinicaId: string,
    filtros: FiltrosAgendamentos
  ): Promise<AgendamentoComDetalhes[]> {
    const supabase = getClient()

    const pacienteIds = await resolverPacienteIds(supabase, clinicaId, filtros.pacienteNome)
    if (pacienteIds !== null && pacienteIds.length === 0) return []

    const query = buildQuery(supabase, clinicaId, filtros, pacienteIds)
      .select('*, pacientes (nome, cpf), dentistas (nome, cor), procedimentos (nome)')
      .limit(10000)

    const { data, error } = await query as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any[] | null
      error: unknown
    }

    if (error) throw error
    return (data ?? []).map(mapRow)
  },

  /** Atualiza um agendamento e retorna o registro atualizado com JOINs */
  async atualizar(
    id: string,
    updates: Partial<AgendamentoInsert>
  ): Promise<AgendamentoComDetalhes> {
    const supabase = getClient()
    const { data, error } = await (supabase as any)
      .from('agendamentos')
      .update(updates)
      .eq('id', id)
      .select('*, pacientes (nome, cpf), dentistas (nome, cor), procedimentos (nome)')
      .single() as { data: any | null; error: unknown }

    if (error) throw error
    return mapRow(data)
  },

  /** Atualiza apenas o status do agendamento */
  async alterarStatus(id: string, status: AgendamentoStatus): Promise<void> {
    const supabase = getClient()
    const { error } = await (supabase as any)
      .from('agendamentos')
      .update({ status })
      .eq('id', id)

    if (error) throw error
  },

  /** Remove um agendamento (admin only via RLS) */
  async excluir(id: string): Promise<void> {
    const supabase = getClient()
    const { error } = await (supabase as any)
      .from('agendamentos')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
