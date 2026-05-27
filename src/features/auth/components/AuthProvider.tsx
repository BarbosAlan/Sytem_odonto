/**
 * AuthProvider — inicializa o estado global de autenticação
 *
 * Deve ser renderizado uma única vez no root layout.
 * Escuta eventos do Supabase Auth e sincroniza com o Zustand store.
 */
'use client'

import { useEffect } from 'react'
import { createClient } from '@/services/supabase/client'
import { useAuthStore } from '../hooks/useAuthStore'
import { authService } from '../services/authService'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading, clear } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    // Inicializa com a sessão existente
    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const profile = await authService.getProfile(session.user.id)
          if (profile && profile.ativo) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              profile,
            })
            return
          }
        }
        clear()
      } catch {
        clear()
      }
    }

    initSession()

    // Escuta mudanças de estado (login, logout, token refresh)
    //
    // ⚠️  A callback NÃO pode ser async-bloqueante:
    //     supabase.auth.signInWithPassword() aguarda todos os listeners antes de
    //     retornar. Se fizermos await aqui, o login trava enquanto buscamos o perfil.
    //     Solução: disparar o fetch do perfil de forma assíncrona (fire-and-forget).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        clear()
        return
      }

      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        // Fire-and-forget: não bloqueia o signInWithPassword()
        void authService.getProfile(session.user.id).then((profile) => {
          if (profile && profile.ativo) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              profile,
            })
          } else {
            clear()
          }
        }).catch(() => clear())
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading, clear])

  return <>{children}</>
}
