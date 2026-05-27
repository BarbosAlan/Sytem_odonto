/**
 * Dentista Service — CRUD via Supabase client-side
 */
import { createClient } from '@/services/supabase/client'
import type { DentistaData, DentistaInsert, DentistaUpdate } from '../types/dentista.types'

type RawRow = Record<string, unknown>

function mapRow(row: RawRow): DentistaData {
  return {
    id: row.id as string,
    clinica_id: row.clinica_id as string,
    nome: row.nome as string,
    cro: row.cro as string,
    especialidades: (row.especialidades as string[]) ?? [],
    email: (row.email as string | null) ?? null,
    telefone: (row.telefone as string | null) ?? null,
    cor: (row.cor as string) ?? '#3B82F6',
    ativo: row.ativo as boolean,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const dentistaService = {
  // ─── Listagem ─────────────────────────────────────────────────────────────

  async listar(clinicaId: string): Promise<DentistaData[]> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('dentistas')
      .select('*')
      .eq('clinica_id', clinicaId)
      .order('nome', { ascending: true }) as { data: RawRow[] | null; error: { message: string } | null }

    if (error) throw new Error(error.message)
    return (data ?? []).map(mapRow)
  },

  // ─── Busca por ID ─────────────────────────────────────────────────────────

  async buscarPorId(id: string): Promise<DentistaData | null> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('dentistas')
      .select('*')
      .eq('id', id)
      .single() as { data: RawRow | null; error: { message: string } | null }

    if (error || !data) return null
    return mapRow(data)
  },

  // ─── Criação ──────────────────────────────────────────────────────────────

  async criar(payload: DentistaInsert): Promise<DentistaData> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('dentistas')
      .insert(payload)
      .select()
      .single() as { data: RawRow | null; error: { message: string } | null }

    if (error || !data) throw new Error(error?.message ?? 'Erro ao criar dentista')
    return mapRow(data)
  },

  // ─── Atualização ──────────────────────────────────────────────────────────

  async atualizar(id: string, updates: DentistaUpdate): Promise<DentistaData> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('dentistas')
      .update(updates)
      .eq('id', id)
      .select()
      .single() as { data: RawRow | null; error: { message: string } | null }

    if (error || !data) throw new Error(error?.message ?? 'Erro ao atualizar dentista')
    return mapRow(data)
  },

  // ─── Alternar ativo/inativo ───────────────────────────────────────────────

  async alternarAtivo(id: string, ativo: boolean): Promise<void> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('dentistas')
      .update({ ativo })
      .eq('id', id) as { error: { message: string } | null }

    if (error) throw new Error(error.message)
  },

  // ─── Exclusão ─────────────────────────────────────────────────────────────

  async excluir(id: string): Promise<void> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('dentistas')
      .delete()
      .eq('id', id) as { error: { message: string } | null }

    if (error) throw new Error(error.message)
  },
}
