/**
 * Tipos do módulo Configurações da Clínica
 */

export interface Endereco {
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
}

export interface Configuracoes {
  /** Horário de abertura, ex: "08:00" */
  horario_abertura?: string
  /** Horário de fechamento, ex: "18:00" */
  horario_fechamento?: string
  /** Dias que funcionam: 0=Dom 1=Seg 2=Ter 3=Qua 4=Qui 5=Sex 6=Sáb */
  dias_funcionamento?: number[]
  /** Duração padrão da consulta em minutos */
  duracao_padrao_consulta?: number
  /** Início do intervalo de almoço, ex: "12:00" */
  intervalo_almoco_inicio?: string
  /** Fim do intervalo de almoço, ex: "13:00" */
  intervalo_almoco_fim?: string
  /** Habilitar agendamento pelo portal do paciente */
  permite_agendamento_online?: boolean
}

export interface ClinicaData {
  id: string
  nome: string
  cnpj: string | null
  telefone: string | null
  email: string | null
  endereco: Endereco
  logo_url: string | null
  configuracoes: Configuracoes
  created_at: string
  updated_at: string
}
