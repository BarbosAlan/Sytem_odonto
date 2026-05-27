/**
 * Procedimento Service — CRUD via Supabase client-side
 */
import { createClient } from '@/services/supabase/client'
import type { ProcedimentoData, ProcedimentoInsert, ProcedimentoUpdate } from '../types/procedimento.types'

type RawRow = Record<string, unknown>

function mapRow(row: RawRow): ProcedimentoData {
  return {
    id: row.id as string,
    clinica_id: row.clinica_id as string,
    nome: row.nome as string,
    codigo: (row.codigo as string | null) ?? null,
    descricao: (row.descricao as string | null) ?? null,
    categoria: (row.categoria as string) ?? 'Outros',
    duracao_minutos: row.duracao_minutos as number,
    preco: parseFloat(String(row.preco ?? 0)),
    cor: (row.cor as string) ?? '#3B82F6',
    ativo: row.ativo as boolean,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export const procedimentoService = {
  // ─── Listagem ─────────────────────────────────────────────────────────────

  async listar(clinicaId: string): Promise<ProcedimentoData[]> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('procedimentos')
      .select('*')
      .eq('clinica_id', clinicaId)
      .order('categoria', { ascending: true })
      .order('nome', { ascending: true }) as {
        data: RawRow[] | null
        error: { message: string } | null
      }

    if (error) throw new Error(error.message)
    return (data ?? []).map(mapRow)
  },

  // ─── Criação ──────────────────────────────────────────────────────────────

  async criar(payload: ProcedimentoInsert): Promise<ProcedimentoData> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('procedimentos')
      .insert(payload)
      .select()
      .single() as { data: RawRow | null; error: { message: string } | null }

    if (error || !data) throw new Error(error?.message ?? 'Erro ao criar procedimento')
    return mapRow(data)
  },

  // ─── Atualização ──────────────────────────────────────────────────────────

  async atualizar(id: string, updates: ProcedimentoUpdate): Promise<ProcedimentoData> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('procedimentos')
      .update(updates)
      .eq('id', id)
      .select()
      .single() as { data: RawRow | null; error: { message: string } | null }

    if (error || !data) throw new Error(error?.message ?? 'Erro ao atualizar procedimento')
    return mapRow(data)
  },

  // ─── Alternar ativo/inativo ───────────────────────────────────────────────

  async alternarAtivo(id: string, ativo: boolean): Promise<void> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('procedimentos')
      .update({ ativo })
      .eq('id', id) as { error: { message: string } | null }

    if (error) throw new Error(error.message)
  },

  // ─── Exclusão ─────────────────────────────────────────────────────────────

  async excluir(id: string): Promise<void> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('procedimentos')
      .delete()
      .eq('id', id) as { error: { message: string } | null }

    if (error) throw new Error(error.message)
  },
}
