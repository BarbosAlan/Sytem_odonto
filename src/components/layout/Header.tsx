/**
 * Header — barra superior do painel
 * Inclui: título, notificações, menu do usuário, menu mobile
 *
 * Usa @base-ui/react via shadcn — padrão render prop (sem asChild)
 */
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Menu } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { USER_ROLE_LABELS } from '@/features/auth/types/auth.types'
import { ROUTES } from '@/config/routes'
import { navigation } from '@/config/navigation'
import { Sidebar } from './Sidebar'

// Mapa path → título da página para o breadcrumb
const PAGE_TITLES: Record<string, string> = {
  [ROUTES.dashboard.home]: 'Dashboard',
}
navigation.forEach((group) =>
  group.items.forEach((item) => {
    PAGE_TITLES[item.href] = item.label
  })
)

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const sorted = Object.keys(PAGE_TITLES).sort((a, b) => b.length - a.length)
  for (const key of sorted) {
    if (pathname.startsWith(key + '/')) return PAGE_TITLES[key]
  }
  return 'Sistema Odontológico'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuthStore()
  const { signOut } = useAuth()

  if (!user) return null

  const { nome, avatar_url, role } = user.profile
  const initials = getInitials(nome)
  const pageTitle = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6">
      {/* Menu mobile — base-ui usa render prop */}
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Abrir menu de navegação"
            />
          }
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar className="h-full" />
        </SheetContent>
      </Sheet>

      {/* Título da página */}
      <h1 className="flex-1 text-base font-semibold text-gray-900 lg:text-lg">
        {pageTitle}
      </h1>

      {/* Ações do header */}
      <div className="flex items-center gap-1">
        {/* Notificações (placeholder — Módulo 9) */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notificações"
          className="relative"
        >
          <Bell className="h-5 w-5 text-gray-500" />
        </Button>

        {/* Menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full p-0"
                aria-label="Menu do usuário"
              />
            }
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={avatar_url ?? undefined} alt={nome} />
              <AvatarFallback className="bg-blue-100 text-xs font-semibold text-blue-700">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold text-gray-900">{nome}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <p className="text-xs font-medium text-blue-600">
                  {USER_ROLE_LABELS[role]}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => router.push(ROUTES.dashboard.configuracoes)}
              className="cursor-pointer"
            >
              Configurações
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={signOut}
              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
            >
              Sair do sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
