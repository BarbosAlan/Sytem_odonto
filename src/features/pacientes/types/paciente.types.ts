/**
 * Tipos do módulo Pacientes
 */

export interface PacienteEndereco {
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
}

export interface PacienteData {
  id: string
  clinica_id: string

  // Dados pessoais
  nome: string
  cpf: string | null
  data_nascimento: string | null   // ISO date: "YYYY-MM-DD"
  sexo: 'M' | 'F' | 'O' | null
  estado_civil: string | null
  profissao: string | null

  // Contato
  telefone: string | null
  email: string | null
  nome_emergencia: string | null
  telefone_emergencia: string | null

  // Endereço
  endereco: PacienteEndereco

  // Plano de saúde
  convenio: string | null
  numero_convenio: string | null

  // Outros
  observacoes: string | null
  ativo: boolean

  created_at: string
  updated_at: string
}

export type PacienteInsert = Omit<PacienteData, 'id' | 'created_at' | 'updated_at'>
export type PacienteUpdate = Partial<
  Omit<PacienteData, 'id' | 'clinica_id' | 'created_at' | 'updated_at'>
>

// ─── Opções de sexo ────────────────────────────────────────────────────────
export const SEXO_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
  { value: 'O', label: 'Outro' },
] as const

// ─── Opções de estado civil ───────────────────────────────────────────────
export const ESTADO_CIVIL_OPTIONS = [
  { value: 'solteiro', label: 'Solteiro(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viuvo', label: 'Viúvo(a)' },
  { value: 'uniao_estavel', label: 'União Estável' },
  { value: 'outro', label: 'Outro' },
] as const

// ─── Estados brasileiros ──────────────────────────────────────────────────
export const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const

// ─── Helpers ──────────────────────────────────────────────────────────────

export function calcularIdade(dataNascimento: string | null): number | null {
  if (!dataNascimento) return null
  const hoje = new Date()
  const nasc = new Date(dataNascimento)
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
    idade--
  }
  return idade
}

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function maskCPF(cpf: string): string {
  // Exibe apenas os últimos 2 dígitos: ***.***.**-xx
  const c = cpf.replace(/\D/g, '')
  if (c.length < 11) return cpf
  return `***.***.**${c.slice(8, 11)}`
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

/** Valida CPF (algoritmo dos dígitos verificadores) */
export function validarCPF(cpf: string): boolean {
  const c = cpf.replace(/\D/g, '')
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false
  const calc = (len: number) => {
    let s = 0
    for (let i = 0; i < len; i++) s += parseInt(c[i]) * (len + 1 - i)
    const r = (s * 10) % 11
    return r === 10 ? 0 : r
  }
  return calc(9) === parseInt(c[9]) && calc(10) === parseInt(c[10])
}
