/**
 * Enums globais do sistema
 * Use estes valores em vez de strings soltas no código
 */

export enum StatusAgendamento {
  AGENDADO = 'agendado',
  CONFIRMADO = 'confirmado',
  REALIZADO = 'realizado',
  CANCELADO = 'cancelado',
  FALTA = 'falta',
}

export enum StatusTratamento {
  PLANEJADO = 'planejado',
  EM_ANDAMENTO = 'em_andamento',
  CONCLUIDO = 'concluido',
  CANCELADO = 'cancelado',
}

export enum StatusFinanceiro {
  PENDENTE = 'pendente',
  PAGO = 'pago',
  CANCELADO = 'cancelado',
}

export enum FormaPagamento {
  DINHEIRO = 'dinheiro',
  CARTAO_CREDITO = 'cartao_credito',
  CARTAO_DEBITO = 'cartao_debito',
  PIX = 'pix',
  CONVENIO = 'convenio',
}

export enum TipoLancamento {
  RECEITA = 'receita',
  DESPESA = 'despesa',
}
