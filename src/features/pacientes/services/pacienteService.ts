/**
 * Paciente Service — CRUD via Supabase client-side
 */
import { createClient } from '@/services/supabase/client'
import type {
  PacienteData,
  PacienteEndereco,
  PacienteInsert,
  PacienteUpdate,
} from '../types/paciente.types'

type RawRow = Record<string, unknown>

function mapRow(row: RawRow): PacienteData {
  return {
    id: row.id as string,
    clinica_id: row.clinica_id as string,
    nome: row.nome as string,
    cpf: (row.cpf as string | null) ?? null,
    data_nascimento: (row.data_nascimento as string | null) ?? null,
    sexo: (row.sexo as 'M' | 'F' | 'O' | null) ?? null,
    estado_civil: (row.estado_civil as string | null) ?? null,
    profissao: (row.profissao as string | null) ?? null,
    telefone: (row.telefone as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    nome_emergencia: (row.nome_emergencia as string | null) ?? null,
    telefone_emergencia: (row.telefone_emergencia as string | null) ?? null,
    endereco: ((row.endereco ?? {}) as PacienteEndereco),
    convenio: (row.convenio as string | null) ?? null,
    numero_convenio: (row.numero_convenio as string | null) ?? null,
    observacoes: (row.observacoes as string | null) ?? null,
    ativo: row.ativo as boolean,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const pacienteService = {
  // ─── Listagem ─────────────────────────────────────────────────────────────

  async listar(
    clinicaId: string,
    opts: { search?: string; ativo?: boolean | null } = {}
  ): Promise<PacienteData[]> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('pacientes')
      .select('*')
      .eq('clinica_id', clinicaId)
      .order('nome', { ascending: true })

    if (opts.search) {
      query = query.ilike('nome', `%${opts.search}%`)
    }
    if (opts.ativo !== null && opts.ativo !== undefined) {
      query = query.eq('ativo', opts.ativo)
    }

    const { data, error } = await query as {
      data: RawRow[] | null
      error: { message: string } | null
    }

    if (error) throw new Error(error.message)
    return (data ?? []).map(mapRow)
  },

  // ─── Busca por ID ─────────────────────────────────────────────────────────

  async buscarPorId(id: string): Promise<PacienteData | null> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single() as { data: RawRow | null; error: { message: string } | null }

    if (error || !data) return null
    return mapRow(data)
  },

  // ─── Criação ──────────────────────────────────────────────────────────────

  async criar(payload: PacienteInsert): Promise<PacienteData> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('pacientes')
      .insert(payload)
      .select()
      .single() as { data: RawRow | null; error: { message: string } | null }

    if (error || !data) throw new Error(error?.message ?? 'Erro ao criar paciente')
    return mapRow(data)
  },

  // ─── Atualização ──────────────────────────────────────────────────────────

  async atualizar(id: string, updates: PacienteUpdate): Promise<PacienteData> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('pacientes')
      .update(updates)
      .eq('id', id)
      .select()
      .single() as { data: RawRow | null; error: { message: string } | null }

    if (error || !data) throw new Error(error?.message ?? 'Erro ao atualizar paciente')
    return mapRow(data)
  },

  // ─── Alternar ativo ───────────────────────────────────────────────────────

  async alternarAtivo(id: string, ativo: boolean): Promise<void> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('pacientes')
      .update({ ativo })
      .eq('id', id) as { error: { message: string } | null }

    if (error) throw new Error(error.message)
  },

  // ─── Exclusão ─────────────────────────────────────────────────────────────

  async excluir(id: string): Promise<void> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('pacientes')
      .delete()
      .eq('id', id) as { error: { message: string } | null }

    if (error) throw new Error(error.message)
  },
}
