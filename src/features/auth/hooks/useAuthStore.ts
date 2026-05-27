/**
 * Zustand Store — estado global de autenticação
 * Fonte única de verdade para o usuário logado
 */
import { create } from 'zustand'
import type { AuthUser } from '../types/auth.types'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean

  // Actions
  setUser: (user: AuthUser | null) => void
  setLoading: (isLoading: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ user: null, isLoading: false }),
}))
