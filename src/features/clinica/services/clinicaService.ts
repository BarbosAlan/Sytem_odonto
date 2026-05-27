/**
 * Clinica Service — operações de leitura/escrita da clínica no Supabase
 * Usa o client-side Supabase (autenticado via sessão do browser)
 */
import { createClient } from '@/services/supabase/client'
import type { ClinicaData, Endereco, Configuracoes } from '../types/clinica.types'

export const clinicaService = {
  // ---------------------------------------------------------------------------
  // Leitura
  // ---------------------------------------------------------------------------

  async getClinica(clinicaId: string): Promise<ClinicaData | null> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('clinica')
      .select('*')
      .eq('id', clinicaId)
      .single() as { data: Record<string, unknown> | null; error: { message: string } | null }

    if (error || !data) return null

    return {
      id: data.id as string,
      nome: data.nome as string,
      cnpj: (data.cnpj as string | null) ?? null,
      telefone: (data.telefone as string | null) ?? null,
      email: (data.email as string | null) ?? null,
      logo_url: (data.logo_url as string | null) ?? null,
      created_at: data.created_at as string,
      updated_at: data.updated_at as string,
      endereco: ((data.endereco ?? {}) as unknown as Endereco),
      configuracoes: ((data.configuracoes ?? {}) as unknown as Configuracoes),
    }
  },

  // ---------------------------------------------------------------------------
  // Informações Gerais
  // ---------------------------------------------------------------------------

  async updateGeral(
    clinicaId: string,
    updates: { nome: string; cnpj?: string | null; telefone?: string | null; email?: string | null }
  ): Promise<void> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('clinica')
      .update(updates)
      .eq('id', clinicaId)

    if (error) throw new Error(error.message)
  },

  // ---------------------------------------------------------------------------
  // Endereço
  // ---------------------------------------------------------------------------

  async updateEndereco(clinicaId: string, endereco: Endereco): Promise<void> {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('clinica')
      .update({ endereco: endereco })
      .eq('id', clinicaId)

    if (error) throw new Error(error.message)
  },

  // ---------------------------------------------------------------------------
  // Configurações de funcionamento
  // ---------------------------------------------------------------------------

  async updateConfiguracoes(clinicaId: string, updates: Partial<Configuracoes>): Promise<void> {
    const supabase = createClient()

    // Busca as configurações atuais para fazer merge
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: current } = await (supabase as any)
      .from('clinica')
      .select('configuracoes')
      .eq('id', clinicaId)
      .single() as { data: { configuracoes: unknown } | null }

    const merged = {
      ...((current?.configuracoes ?? {}) as unknown as Configuracoes),
      ...updates,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('clinica')
      .update({ configuracoes: merged })
      .eq('id', clinicaId)

    if (error) throw new Error(error.message)
  },

  // ---------------------------------------------------------------------------
  // Logo
  // ---------------------------------------------------------------------------

  async uploadLogo(clinicaId: string, file: File): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
    const path = `${clinicaId}/logo.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('clinica-logos')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) throw new Error(uploadError.message)

    const { data: { publicUrl } } = supabase.storage
      .from('clinica-logos')
      .getPublicUrl(path)

    // Salva a URL no registro da clínica
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('clinica')
      .update({ logo_url: publicUrl })
      .eq('id', clinicaId)

    if (updateError) throw new Error(updateError.message)

    return publicUrl
  },

  async removeLogo(clinicaId: string): Promise<void> {
    const supabase = createClient()

    // Busca o logo_url atual para saber o caminho no storage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('clinica')
      .select('logo_url')
      .eq('id', clinicaId)
      .single() as { data: { logo_url: string | null } | null }

    if (data?.logo_url) {
      // Extrai o path após "clinica-logos/"
      const match = data.logo_url.match(/clinica-logos\/(.+)$/)
      if (match) {
        await supabase.storage.from('clinica-logos').remove([match[1]])
      }
    }

    // Limpa a URL no banco
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('clinica')
      .update({ logo_url: null })
      .eq('id', clinicaId)

    if (error) throw new Error(error.message)
  },
}
