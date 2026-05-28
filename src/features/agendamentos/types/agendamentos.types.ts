/**
 * Tipos do módulo Agendamentos (lista/CRUD)
 * Extende os tipos base do módulo Agenda sem duplicá-los.
 */

export type {
  AgendamentoData,
  AgendamentoInsert,
  AgendamentoComDetalhes,
  AgendamentoStatus,
  DentistaOption,
  ProcedimentoOption,
  PacienteOption,
} from '@/features/agenda/types/agenda.types'

export interface FiltrosAgendamentos {
  dataInicio: string    // 'YYYY-MM-DD' ou ''
  dataFim: string       // 'YYYY-MM-DD' ou ''
  dentistaId: string    // UUID ou ''
  pacienteNome: string  // texto livre para busca ilike
  status: string        // AgendamentoStatus | ''
}

export const filtrosDefault: FiltrosAgendamentos = {
  dataInicio: '',
  dataFim: '',
  dentistaId: '',
  pacienteNome: '',
  status: '',
}

export const POR_PAGINA = 20
