/**
 * Tipos e constantes do módulo Agenda
 */

export const AGENDAMENTO_STATUS = [
  'agendado',
  'confirmado',
  'em_atendimento',
  'concluido',
  'cancelado',
  'faltou',
] as const

export type AgendamentoStatus = (typeof AGENDAMENTO_STATUS)[number]

export const STATUS_LABELS: Record<AgendamentoStatus, string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  em_atendimento: 'Em Atendimento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  faltou: 'Não Compareceu',
}

export const STATUS_COLORS: Record<
  AgendamentoStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  agendado: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-300',
    dot: 'bg-blue-500',
  },
  confirmado: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-300',
    dot: 'bg-green-500',
  },
  em_atendimento: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-300',
    dot: 'bg-orange-500',
  },
  concluido: {
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    border: 'border-gray-300',
    dot: 'bg-gray-400',
  },
  cancelado: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-300',
    dot: 'bg-red-500',
  },
  faltou: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-300',
    dot: 'bg-yellow-500',
  },
}

export interface AgendamentoData {
  id: string
  clinica_id: string
  paciente_id: string | null
  dentista_id: string
  procedimento_id: string | null
  data_hora: string // ISO 8601 with timezone
  duracao_minutos: number
  status: AgendamentoStatus
  observacoes: string | null
  cor: string | null
  created_at: string
  updated_at: string
}

export interface AgendamentoInsert {
  clinica_id: string
  paciente_id?: string | null
  dentista_id: string
  procedimento_id?: string | null
  data_hora: string
  duracao_minutos: number
  status?: AgendamentoStatus
  observacoes?: string | null
  cor?: string | null
}

/** Agendamento com dados das entidades relacionadas (resultado do JOIN) */
export interface AgendamentoComDetalhes extends AgendamentoData {
  paciente_nome: string | null
  paciente_cpf: string | null
  dentista_nome: string
  dentista_cor: string
  procedimento_nome: string | null
}

// ─── Tipos para selects do formulário ────────────────────────────────────────

export interface PacienteOption {
  id: string
  nome: string
  cpf: string | null
  telefone: string | null
}

export interface DentistaOption {
  id: string
  nome: string
  cor: string
  especialidades: string[]
}

export interface ProcedimentoOption {
  id: string
  nome: string
  duracao_minutos: number
  cor: string | null
}

export type AgendaView = 'week' | 'day' | 'month'
