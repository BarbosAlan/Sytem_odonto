/**
 * Schemas de validação — Procedimentos
 */
import { z } from 'zod'
import { CATEGORIAS_PROCEDIMENTO } from '../types/procedimento.types'

export const procedimentoSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(120, 'Nome muito longo'),

  codigo: z.string().max(30, 'Código muito longo'),

  descricao: z.string().max(500, 'Descrição muito longa'),

  categoria: z.enum(CATEGORIAS_PROCEDIMENTO, 'Selecione uma categoria válida'),

  duracao_minutos: z
    .number({ message: 'Duração inválida' })
    .int('Duração deve ser um número inteiro')
    .min(5, 'Duração mínima: 5 minutos')
    .max(480, 'Duração máxima: 8 horas'),

  /** Recebemos como string para não perder casas decimais no input */
  preco_str: z
    .string()
    .regex(/^\d+([.,]\d{0,2})?$/, 'Preço inválido')
    .or(z.literal('')),

  cor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),

  ativo: z.boolean(),
})

export type ProcedimentoFormValues = z.infer<typeof procedimentoSchema>

/** Converte o campo preco_str para número */
export function precoStrToNumber(precoStr: string): number {
  if (!precoStr) return 0
  return parseFloat(precoStr.replace(',', '.')) || 0
}
