/**
 * Schema de edição — reutiliza o schema de criação do módulo Agenda.
 * Os campos são idênticos; o que muda é a operação (atualizar vs criar).
 */

export {
  agendamentoSchema as agendamentoEditarSchema,
  agendamentoDefaultValues as agendamentoEditarDefaultValues,
} from '@/features/agenda/validations/agendamento.schemas'

export type { AgendamentoFormValues as AgendamentoEditarFormValues } from '@/features/agenda/validations/agendamento.schemas'
