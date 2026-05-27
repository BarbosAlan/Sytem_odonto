/**
 * Tipos do módulo de autenticação
 */

export type UserRole = 'admin' | 'dentista' | 'secretaria' | 'recepcionista'

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  dentista: 'Dentista',
  secretaria: 'Secretaria',
  recepcionista: 'Recepcionista',
}

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700',
  dentista: 'bg-blue-100 text-blue-700',
  secretaria: 'bg-green-100 text-green-700',
  recepcionista: 'bg-orange-100 text-orange-700',
}

export interface UserProfile {
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

export interface AuthUser {
  id: string
  email: string
  profile: UserProfile
}

export interface Clinica {
  id: string
  nome: string
  cnpj: string | null
  telefone: string | null
  email: string | null
  endereco: Record<string, string> | null
  logo_url: string | null
  configuracoes: Record<string, unknown>
  created_at: string
  updated_at: string
}
