/**
 * Tipos do módulo Procedimentos
 */

export interface ProcedimentoData {
  id: string
  clinica_id: string
  nome: string
  codigo: string | null
  descricao: string | null
  categoria: string
  duracao_minutos: number
  preco: number
  cor: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export type ProcedimentoInsert = Omit<ProcedimentoData, 'id' | 'created_at' | 'updated_at'>
export type ProcedimentoUpdate = Partial<
  Omit<ProcedimentoData, 'id' | 'clinica_id' | 'created_at' | 'updated_at'>
>

// ─── Categorias odontológicas ──────────────────────────────────────────────
export const CATEGORIAS_PROCEDIMENTO = [
  'Prevenção',
  'Dentística',
  'Endodontia',
  'Periodontia',
  'Cirurgia',
  'Ortodontia',
  'Implantodontia',
  'Prótese',
  'Radiologia',
  'Outros',
] as const

export type CategoriaProcedimento = (typeof CATEGORIAS_PROCEDIMENTO)[number]

// ─── Cores para a agenda ───────────────────────────────────────────────────
export const CORES_PROCEDIMENTO = [
  { value: '#3B82F6', label: 'Azul' },
  { value: '#10B981', label: 'Verde' },
  { value: '#8B5CF6', label: 'Roxo' },
  { value: '#F59E0B', label: 'Âmbar' },
  { value: '#EF4444', label: 'Vermelho' },
  { value: '#F97316', label: 'Laranja' },
  { value: '#06B6D4', label: 'Ciano' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#14B8A6', label: 'Teal' },
  { value: '#6B7280', label: 'Cinza' },
] as const

// ─── Durações predefinidas (minutos) ──────────────────────────────────────
export const DURACOES_PADRAO = [
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' },
] as const

// ─── Helpers de formatação ─────────────────────────────────────────────────

export function formatPreco(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos} min`
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}
