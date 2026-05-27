/**
 * useAuth — hook principal de autenticação
 *
 * Lê o estado do useAuthStore e expõe métodos de autenticação.
 * Deve ser usado em Client Components.
 */
'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/services/supabase/client'
import { ROUTES } from '@/config/routes'
import { useAuthStore } from './useAuthStore'

export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()

  const signIn = useCallback(
    async (email: string, password: string) => {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push(ROUTES.dashboard.home)
      router.refresh()
    },
    [router]
  )

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    store.clear()
    router.push(ROUTES.auth.login)
    router.refresh()
  }, [router, store])

  const resetPassword = useCallback(async (email: string) => {
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })
    if (error) throw error
  }, [])

  const updatePassword = useCallback(
    async (newPassword: string) => {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Senha atualizada com sucesso!')
      router.push(ROUTES.dashboard.home)
    },
    [router]
  )

  return {
    user: store.user,
    isLoading: store.isLoading,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  }
}
