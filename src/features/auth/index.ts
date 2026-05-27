/**
 * Public API do módulo de autenticação
 * Exporte apenas o que outros módulos precisam consumir
 */

// Componentes
export { AuthProvider } from './components/AuthProvider'
export { LoginForm } from './components/LoginForm'
export { ResetPasswordForm } from './components/ResetPasswordForm'
export { LogoutButton } from './components/LogoutButton'

// Hooks
export { useAuth } from './hooks/useAuth'
export { useAuthStore } from './hooks/useAuthStore'
export { usePermissions } from './hooks/usePermissions'

// Tipos
export type { UserRole, UserProfile, AuthUser, Clinica } from './types/auth.types'
export { USER_ROLE_LABELS, USER_ROLE_COLORS } from './types/auth.types'

