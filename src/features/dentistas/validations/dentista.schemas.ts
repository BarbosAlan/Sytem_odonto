/**
 * Schemas de validação — Dentistas
 */
import { z } from 'zod'

export const dentistaSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),

  cro: z
    .string()
    .min(3, 'CRO inválido')
    .max(30, 'CRO muito longo'),

  especialidades: z
    .array(z.string())
    .min(1, 'Selecione pelo menos uma especialidade'),

  /** Campo de texto — string vazia = sem e-mail */
  email: z
    .string()
    .refine((v) => v === '' || z.string().email().safeParse(v).success, {
      message: 'E-mail inválido',
    }),

  /** Campo de texto — string vazia = sem telefone */
  telefone: z.string().max(20, 'Telefone muito longo'),

  cor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),

  ativo: z.boolean(),
})

export type DentistaFormValues = z.infer<typeof dentistaSchema>
