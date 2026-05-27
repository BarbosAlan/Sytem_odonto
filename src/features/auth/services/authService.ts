/**
 * Auth Service — operações no Supabase relacionadas à autenticação
 * Sem lógica de UI, apenas acesso a dados
 */
import { createClient } from '@/services/supabase/client'
import type { UserProfile, Clinica } from '../types/auth.types'
import type { UpdateProfileFormData } from '../validations/auth.schemas'

export const authService = {
  /**
   * Busca o perfil completo de um usuário pelo ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) return null
    return data as UserProfile
  },

  /**
   * Atualiza campos editáveis do perfil do usuário
   */
  async updateProfile(
    userId: string,
    updates: UpdateProfileFormData & { avatar_url?: string }
  ): Promise<void> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('perfis')
      .update(updates)
      .eq('id', userId)

    if (error) throw new Error(error.message)
  },

  /**
   * Busca os dados da clínica pelo ID
   */
  async getClinica(clinicaId: string): Promise<Clinica | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('clinica')
      .select('*')
      .eq('id', clinicaId)
      .single()

    if (error || !data) return null
    return data as Clinica
  },
}
