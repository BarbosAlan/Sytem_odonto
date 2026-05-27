/**
 * Layout protegido do painel administrativo
 *
 * - Verifica autenticação server-side (via Supabase)
 * - Renderiza Sidebar + Header + conteúdo principal
 * - Middleware já faz o redirect, mas verificamos novamente por segurança
 */
import { redirect } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { ROUTES } from '@/config/routes'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(ROUTES.auth.login)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar — oculta em mobile, visível em desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Área principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
