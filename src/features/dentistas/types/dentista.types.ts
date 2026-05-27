/**
 * Tipos do módulo Dentistas
 */

export interface DentistaData {
  id: string
  clinica_id: string
  nome: string
  cro: string
  especialidades: string[]
  email: string | null
  telefone: string | null
  cor: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export type DentistaInsert = Omit<DentistaData, 'id' | 'created_at' | 'updated_at'>
export type DentistaUpdate = Partial<Omit<DentistaData, 'id' | 'clinica_id' | 'created_at' | 'updated_at'>>

// ─── Especialidades odontológicas reconhecidas ─────────────────────────────
export const ESPECIALIDADES_ODONTO = [
  'Clínica Geral',
  'Ortodontia',
  'Endodontia',
  'Periodontia',
  'Implantodontia',
  'Cirurgia Oral',
  'Odontopediatria',
  'Prótese Dentária',
  'Radiologia',
  'Estomatologia',
  'Dentística',
  'Oclusão',
] as const

export type EspecialidadeOdonto = (typeof ESPECIALIDADES_ODONTO)[number]

// ─── Paleta de cores para a agenda ─────────────────────────────────────────
export const CORES_CALENDARIO = [
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
