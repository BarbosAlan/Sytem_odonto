/**
 * Sidebar — navegação lateral do painel
 * Responsivo (colapsável desktop / Sheet mobile)
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

import { navigation, type NavItem } from '@/config/navigation'
import { useAuthStore } from '@/features/auth/hooks/useAuthStore'
import { USER_ROLE_LABELS, type UserRole } from '@/features/auth/types/auth.types'
import { LogoutButton } from '@/features/auth/components/LogoutButton'
import { cn } from '@/lib/utils'

function isItemVisible(item: NavItem, role: UserRole): boolean {
  return item.roles === 'all' || item.roles.includes(role)
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuthStore()

  if (!user) return null

  const { role, nome, avatar_url } = user.profile
  const initials = getInitials(nome)

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-3 border-b border-gray-100 px-4 py-5',
          collapsed && 'justify-center px-2'
        )}
      >
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow">
          <Stethoscope className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="truncate text-sm font-bold text-gray-900">OdontoSystem</p>
            <p className="truncate text-xs text-gray-400">Gestão Odontológica</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-5 px-2">
          {navigation.map((group) => {
            const visibleItems = group.items.filter((item) =>
              isItemVisible(item, role)
            )
            if (visibleItems.length === 0) return null

            return (
              <div key={group.title}>
                {!collapsed && (
                  <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {group.title}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
                    const Icon = item.icon

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          title={collapsed ? item.label : undefined}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                            isActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                            collapsed && 'justify-center px-2'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-4 w-4 flex-shrink-0',
                              isActive ? 'text-blue-600' : 'text-gray-400'
                            )}
                          />
                          {!collapsed && (
                            <span className="flex-1 truncate">{item.label}</span>
                          )}
                          {!collapsed && item.badge && (
                            <Badge
                              variant="secondary"
                              className="ml-auto text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* User section */}
      <div className={cn('space-y-1 p-3', collapsed && 'flex flex-col items-center')}>
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={avatar_url ?? undefined} alt={nome} />
            <AvatarFallback className="bg-blue-100 text-xs font-semibold text-blue-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-gray-900">{nome}</p>
              <p className="truncate text-xs text-gray-400">
                {USER_ROLE_LABELS[role]}
              </p>
            </div>
          )}
        </div>

        <LogoutButton
          variant="ghost"
          showLabel={!collapsed}
          className={cn(
            'w-full justify-start text-gray-500 hover:bg-red-50 hover:text-red-600',
            collapsed && 'justify-center px-2'
          )}
        />
      </div>

      {/* Botão de colapso */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="absolute -right-3 top-[72px] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50"
        aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-gray-600" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-gray-600" />
        )}
      </button>
    </aside>
  )
}
