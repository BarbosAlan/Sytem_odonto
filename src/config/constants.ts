/**
 * Constantes de negócio do sistema
 */

export const APP_NAME = 'Sistema Odontológico'
export const APP_VERSION = '1.0.0'

/** Paginação padrão */
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/** Duração padrão de consulta em minutos */
export const DEFAULT_APPOINTMENT_DURATION = 60

/** Horários de funcionamento */
export const CLINIC_HOURS = {
  start: '08:00',
  end: '18:00',
  interval: 30, // minutos entre slots
}

/** Labels de exibição para enums */
export const STATUS_AGENDAMENTO_LABELS: Record<string, string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  realizado: 'Realizado',
  cancelado: 'Cancelado',
  falta: 'Falta',
}

export const STATUS_TRATAMENTO_LABELS: Record<string, string> = {
  planejado: 'Planejado',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export const FORMA_PAGAMENTO_LABELS: Record<string, string> = {
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  pix: 'PIX',
  convenio: 'Convênio',
}
