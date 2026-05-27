/**
 * Tipos do banco de dados Supabase
 *
 * ⚠️ Este arquivo será substituído pelos tipos gerados automaticamente via CLI:
 *   npx supabase gen types typescript --project-id <ID> > src/types/database.types.ts
 *
 * Por enquanto contém a estrutura base esperada para o sistema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'dentista' | 'secretaria' | 'recepcionista'
export type StatusAgendamento = 'agendado' | 'confirmado' | 'realizado' | 'cancelado' | 'cancelado_tardio' | 'falta' | 'reagendado'
export type StatusTratamento = 'planejado' | 'em_andamento' | 'concluido' | 'cancelado'
export type StatusFinanceiro = 'pendente' | 'pago' | 'parcial' | 'cancelado'
export type FormaPagamento = 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'convenio'
export type TipoLancamento = 'receita' | 'despesa'
export type CanalNotificacao = 'email' | 'whatsapp' | 'sms'

export interface Database {
  public: {
    Tables: {
      clinica: {
        Row: {
          id: string
          nome: string
          cnpj: string | null
          telefone: string | null
          email: string | null
          endereco: Json
          logo_url: string | null
          configuracoes: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clinica']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clinica']['Insert']>
      }

      perfis: {
        Row: {
          id: string
          clinica_id: string | null
          nome: string
          role: UserRole
          avatar_url: string | null
          telefone: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['perfis']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['perfis']['Insert']>
      }

      pacientes: {
        Row: {
          id: string
          clinica_id: string
          nome: string
          cpf: string | null
          rg: string | null
          data_nascimento: string | null
          sexo: 'M' | 'F' | 'outro' | null
          telefone: string | null
          email: string | null
          endereco: Json | null
          convenio_id: string | null
          grupo_sanguineo: string | null
          alergias: string | null
          observacoes_medicas: string | null
          consentimento_lgpd: boolean
          data_consentimento: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pacientes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['pacientes']['Insert']>
      }

      dentistas: {
        Row: {
          id: string
          usuario_id: string
          clinica_id: string
          cro: string
          especialidades: string[]
          bio: string | null
          foto_url: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['dentistas']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['dentistas']['Insert']>
      }

      procedimentos: {
        Row: {
          id: string
          clinica_id: string
          nome: string
          descricao: string | null
          duracao_minutos: number
          valor_padrao: number | null
          especialidade: string | null
          cor: string
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['procedimentos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['procedimentos']['Insert']>
      }

      agendamentos: {
        Row: {
          id: string
          clinica_id: string
          paciente_id: string
          dentista_id: string
          procedimento_id: string | null
          data_hora_inicio: string
          data_hora_fim: string
          status: StatusAgendamento
          observacoes: string | null
          origem: 'manual' | 'whatsapp' | 'site'
          criado_por: string
          cancelado_por: string | null
          motivo_cancelamento: string | null
          reagendamento_de: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['agendamentos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['agendamentos']['Insert']>
      }

      prontuarios: {
        Row: {
          id: string
          clinica_id: string
          paciente_id: string
          dentista_id: string
          agendamento_id: string | null
          data_atendimento: string
          queixa_principal: string | null
          anamnese: string | null
          exame_clinico: string | null
          diagnostico: string | null
          plano_tratamento: string | null
          procedimentos_realizados: Json | null
          prescricao: string | null
          observacoes: string | null
          bloqueado: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['prontuarios']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['prontuarios']['Insert']>
      }

      lancamentos: {
        Row: {
          id: string
          clinica_id: string
          paciente_id: string | null
          agendamento_id: string | null
          tipo: TipoLancamento
          categoria: string | null
          descricao: string
          valor: number
          status: StatusFinanceiro
          forma_pagamento: FormaPagamento | null
          parcelas: number | null
          data_vencimento: string | null
          data_pagamento: string | null
          convenio_id: string | null
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['lancamentos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['lancamentos']['Insert']>
      }

      logs_auditoria: {
        Row: {
          id: string
          clinica_id: string | null
          usuario_id: string | null
          entidade: string
          entidade_id: string | null
          acao: 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout'
          dados_anteriores: Json | null
          dados_novos: Json | null
          ip: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['logs_auditoria']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: {
      user_role: UserRole
      status_agendamento: StatusAgendamento
      status_tratamento: StatusTratamento
      status_financeiro: StatusFinanceiro
      forma_pagamento: FormaPagamento
      tipo_lancamento: TipoLancamento
      canal_notificacao: CanalNotificacao
    }
  }
}
