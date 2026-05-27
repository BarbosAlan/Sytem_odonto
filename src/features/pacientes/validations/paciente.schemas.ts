/**
 * Schemas de validação — Pacientes
 */
import { z } from 'zod'
import { validarCPF } from '../types/paciente.types'

export const pacienteSchema = z.object({
  // Dados pessoais
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(150, 'Nome muito longo'),

  cpf: z
    .string()
    .refine((v) => v === '' || validarCPF(v), { message: 'CPF inválido' }),

  data_nascimento: z.string(),   // "YYYY-MM-DD" ou ""

  sexo: z.enum(['M', 'F', 'O']).or(z.literal('')),

  estado_civil: z.string().max(30),

  profissao: z.string().max(80),

  // Contato
  telefone: z.string().max(20),
  email: z
    .string()
    .refine((v) => v === '' || z.string().email().safeParse(v).success, {
      message: 'E-mail inválido',
    }),
  nome_emergencia: z.string().max(150),
  telefone_emergencia: z.string().max(20),

  // Endereço
  cep: z.string().max(9),
  logradouro: z.string().max(200),
  numero: z.string().max(20),
  complemento: z.string().max(100),
  bairro: z.string().max(100),
  cidade: z.string().max(100),
  estado: z.string().max(2),

  // Saúde
  convenio: z.string().max(100),
  numero_convenio: z.string().max(50),

  // Outros
  observacoes: z.string().max(1000),
  ativo: z.boolean(),
})

export type PacienteFormValues = z.infer<typeof pacienteSchema>

export const pacienteDefaultValues: PacienteFormValues = {
  nome: '',
  cpf: '',
  data_nascimento: '',
  sexo: '',
  estado_civil: '',
  profissao: '',
  telefone: '',
  email: '',
  nome_emergencia: '',
  telefone_emergencia: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  convenio: '',
  numero_convenio: '',
  observacoes: '',
  ativo: true,
}
