/**
 * agendaService — operações CRUD de agendamentos e lookups de suporte
 */

import { createClient as createBrowserClient } from '@/services/supabase/client'
import type {
  AgendamentoData,
  AgendamentoComDetalhes,
  AgendamentoInsert,
  AgendamentoStatus,
  PacienteOption,
  DentistaOption,
  ProcedimentoOption,
} from '../types/agenda.types'

function getClient() {
  return createBrowserClient()
}

export const agendaService = {
  /** Lista agendamentos do período com dados relacionados */
  async listarPorPeriodo(
    clinicaId: string,
    dataInicio: string,
    dataFim: string,
    dentistaId?: string | null
  ): Promise<AgendamentoComDetalhes[]> {
    const supabase = getClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('agendamentos')
      .select(
        `*, pacientes (nome, cpf), dentistas (nome, cor), procedimentos (nome)`
      )
      .eq('clinica_id', clinicaId)
      .gte('data_hora', dataInicio)
      .lte('data_hora', dataFim)
      .order('data_hora', { ascending: true })

    if (dentistaId) {
      query = query.eq('dentista_id', dentistaId)
    }

    const { data, error } = await query
    if (error) throw error

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []).map((row: any) => ({
      ...row,
      paciente_nome: row.pacientes?.nome ?? null,
      paciente_cpf: row.pacientes?.cpf ?? null,
      dentista_nome: row.dentistas?.nome ?? '',
      dentista_cor: row.dentistas?.cor ?? '#6B7280',
      procedimento_nome: row.procedimentos?.nome ?? null,
    })) as AgendamentoComDetalhes[]
  },

  /** Cria um novo agendamento */
  async criar(payload: AgendamentoInsert): Promise<AgendamentoData> {
    const supabase = getClient()
    const { data, error } = await (supabase as any)
      .from('agendamentos')
      .insert(payload)
      .select()
      .single() as { data: AgendamentoData | null; error: unknown }

    if (error) throw error
    return data!
  },

  /** Atualiza campos de um agendamento */
  async atualizar(
    id: string,
    updates: Partial<AgendamentoInsert>
  ): Promise<AgendamentoData> {
    const supabase = getClient()
    const { data, error } = await (supabase as any)
      .from('agendamentos')
      .update(updates)
      .eq('id', id)
      .select()
      .single() as { data: AgendamentoData | null; error: unknown }

    if (error) throw error
    return data!
  },

  /** Troca apenas o status */
  async alterarStatus(id: string, status: AgendamentoStatus): Promise<void> {
    const supabase = getClient()
    const { error } = await (supabase as any)
      .from('agendamentos')
      .update({ status })
      .eq('id', id)

    if (error) throw error
  },

  /** Exclui um agendamento (apenas admin via RLS) */
  async excluir(id: string): Promise<void> {
    const supabase = getClient()
    const { error } = await (supabase as any)
      .from('agendamentos')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // ─── Lookups para os selects do formulário ─────────────────────────────────

  async listarDentistas(clinicaId: string): Promise<DentistaOption[]> {
    const supabase = getClient()
    const { data, error } = await (supabase as any)
      .from('dentistas')
      .select('id, nome, cor, especialidades')
      .eq('clinica_id', clinicaId)
      .eq('ativo', true)
      .order('nome') as { data: DentistaOption[] | null; error: unknown }

    if (error) throw error
    return data ?? []
  },

  async listarProcedimentos(clinicaId: string): Promise<ProcedimentoOption[]> {
    const supabase = getClient()
    const { data, error } = await (supabase as any)
      .from('procedimentos')
      .select('id, nome, duracao_minutos, cor')
      .eq('clinica_id', clinicaId)
      .eq('ativo', true)
      .order('nome') as { data: ProcedimentoOption[] | null; error: unknown }

    if (error) throw error
    return data ?? []
  },

  async buscarPacientes(
    clinicaId: string,
    search: string
  ): Promise<PacienteOption[]> {
    const supabase = getClient()
    const { data, error } = await (supabase as any)
      .from('pacientes')
      .select('id, nome, cpf, telefone')
      .eq('clinica_id', clinicaId)
      .eq('ativo', true)
      .ilike('nome', `%${search}%`)
      .order('nome')
      .limit(30) as { data: PacienteOption[] | null; error: unknown }

    if (error) throw error
    return data ?? []
  },
}
