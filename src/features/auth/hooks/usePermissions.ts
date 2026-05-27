/**
 * usePermissions — controle de acesso baseado em papel (RBAC)
 *
 * Define quais ações cada papel pode executar no sistema.
 * Use em Client Components para mostrar/esconder elementos de UI.
 * A segurança real é garantida pelo RLS no Supabase (server-side).
 */
import { useAuthStore } from './useAuthStore'
import type { UserRole } from '../types/auth.types'

/**
 * Mapa de permissões por papel.
 * Formato: 'recurso:acao' ou 'recurso:acao:escopo'
 * Admin tem '*' (acesso total)
 */
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['*'],

  dentista: [
    'pacientes:read:own',
    'pacientes:write',
    'agenda:read:own',
    'agendamentos:read:own',
    'agendamentos:write',
    'agendamentos:cancel',
    'prontuarios:read:own',
    'prontuarios:write:own',
    'odontograma:read:own',
    'odontograma:write:own',
    'anexos:read:own',
    'anexos:write',
    'financeiro:read:own',
    'relatorios:read:own',
  ],

  secretaria: [
    'pacientes:read',
    'pacientes:write',
    'agenda:read',
    'agendamentos:read',
    'agendamentos:write',
    'agendamentos:cancel',
    'financeiro:read',
    'financeiro:write',
    'relatorios:read',
    'notificacoes:read',
    'notificacoes:write',
  ],

  recepcionista: [
    'pacientes:read',
    'pacientes:write:basic',
    'agenda:read',
    'agendamentos:read',
    'agendamentos:write',
    'agendamentos:cancel',
  ],
}

export function usePermissions() {
  const { user } = useAuthStore()

  /**
   * Verifica se o usuário tem a permissão especificada
   * @example can('prontuarios:write:own')
   */
  const can = (permission: string): boolean => {
    if (!user) return false
    const { role } = user.profile
    if (role === 'admin') return true
    return ROLE_PERMISSIONS[role].includes(permission)
  }

  /**
   * Verifica se o usuário tem um dos papéis especificados
   * @example hasRole(['admin', 'secretaria'])
   */
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false
    const rolesArray = Array.isArray(roles) ? roles : [roles]
    return rolesArray.includes(user.profile.role)
  }

  const isAdmin = (): boolean => user?.profile.role === 'admin'
  const isDentista = (): boolean => user?.profile.role === 'dentista'
  const isSecretaria = (): boolean => user?.profile.role === 'secretaria'
  const isRecepcionista = (): boolean => user?.profile.role === 'recepcionista'

  return {
    can,
    hasRole,
    isAdmin,
    isDentista,
    isSecretaria,
    isRecepcionista,
    role: user?.profile.role ?? null,
  }
}
