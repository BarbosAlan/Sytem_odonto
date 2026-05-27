/**
 * Schemas de validação — Configurações da Clínica
 */
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cleanNumbers(value: string | undefined | null) {
  return value ? value.replace(/\D/g, '') : ''
}

// ---------------------------------------------------------------------------
// Informações Gerais
// ---------------------------------------------------------------------------

export const clinicaGeralSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),

  cnpj: z
    .string()
    .optional()
    .refine(
      (val) => !val || cleanNumbers(val).length === 0 || cleanNumbers(val).length === 14,
      { message: 'CNPJ deve ter 14 dígitos' }
    ),

  telefone: z.string().optional(),

  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: 'E-mail inválido' }
    ),
})

export type ClinicaGeralFormData = z.infer<typeof clinicaGeralSchema>

// ---------------------------------------------------------------------------
// Endereço
// ---------------------------------------------------------------------------

export const clinicaEnderecoSchema = z.object({
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().max(2).optional(),
})

export type ClinicaEnderecoFormData = z.infer<typeof clinicaEnderecoSchema>

// ---------------------------------------------------------------------------
// Funcionamento
// ---------------------------------------------------------------------------

export const clinicaHorarioSchema = z.object({
  horario_abertura: z.string().optional(),
  horario_fechamento: z.string().optional(),
  dias_funcionamento: z.array(z.number()).optional(),
  duracao_padrao_consulta: z.number().min(10).max(240).optional(),
  intervalo_almoco_inicio: z.string().optional(),
  intervalo_almoco_fim: z.string().optional(),
  permite_agendamento_online: z.boolean().optional(),
})

export type ClinicaHorarioFormData = z.infer<typeof clinicaHorarioSchema>
