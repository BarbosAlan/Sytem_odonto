/**
 * Schema Zod para o formulário de agendamento
 * Regras: sem .default(), sem .transform() — valores default ficam no useForm
 */

import { z } from 'zod'
import { AGENDAMENTO_STATUS } from '../types/agenda.types'

export const agendamentoSchema = z.object({
  paciente_id: z.string(),
  dentista_id: z.string().min(1, 'Selecione um dentista'),
  procedimento_id: z.string(),
  data: z.string().min(1, 'Informe a data'),
  hora: z.string().min(1, 'Informe o horário'),
  duracao_minutos: z
    .number({ message: 'Informe a duração' })
    .int('Deve ser número inteiro')
    .min(5, 'Mínimo 5 minutos')
    .max(480, 'Máximo 8 horas'),
  status: z.enum(AGENDAMENTO_STATUS, 'Status inválido'),
  observacoes: z.string(),
})

export type AgendamentoFormValues = z.infer<typeof agendamentoSchema>

export const agendamentoDefaultValues: AgendamentoFormValues = {
  paciente_id: '',
  dentista_id: '',
  procedimento_id: '',
  data: '',
  hora: '',
  duracao_minutos: 30,
  status: 'agendado',
  observacoes: '',
}
