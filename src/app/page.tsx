/**
 * Rota raiz — redireciona baseado no estado de autenticação
 */
import { redirect } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { ROUTES } from '@/config/routes'

export default async function RootPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect(ROUTES.dashboard.home)
  }

  redirect(ROUTES.auth.login)
}
