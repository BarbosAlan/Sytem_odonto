/**
 * Configuração de navegação do sistema
 * Define itens visíveis por papel de usuário
 */
import {
  LayoutDashboard,
  Users,
  UserCog,
  Stethoscope,
  CalendarDays,
  CalendarClock,
  ClipboardList,
  Paperclip,
  DollarSign,
  BarChart3,
  Bell,
  Settings,
  FileText,
  ScrollText,
  type LucideIcon,
} from 'lucide-react'

import type { UserRole } from '@/features/auth/types/auth.types'
import { ROUTES } from './routes'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** 'all' = visível para todos os papéis */
  roles: UserRole[] | 'all'
  badge?: number
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    title: 'Geral',
    items: [
      {
        label: 'Dashboard',
        href: ROUTES.dashboard.home,
        icon: LayoutDashboard,
        roles: 'all',
      },
    ],
  },
  {
    title: 'Clínica',
    items: [
      {
        label: 'Agenda',
        href: ROUTES.dashboard.agenda,
        icon: CalendarDays,
        roles: 'all',
      },
      {
        label: 'Agendamentos',
        href: ROUTES.dashboard.agendamentos.list,
        icon: CalendarClock,
        roles: 'all',
      },
      {
        label: 'Pacientes',
        href: ROUTES.dashboard.pacientes.list,
        icon: Users,
        roles: 'all',
      },
      {
        label: 'Prontuários',
        href: ROUTES.dashboard.prontuarios.list,
        icon: ClipboardList,
        roles: ['admin', 'dentista'],
      },
      {
        label: 'Anexos',
        href: ROUTES.dashboard.anexos,
        icon: Paperclip,
        roles: ['admin', 'dentista'],
      },
    ],
  },
  {
    title: 'Gestão',
    items: [
      {
        label: 'Financeiro',
        href: ROUTES.dashboard.financeiro.list,
        icon: DollarSign,
        roles: ['admin', 'secretaria', 'dentista'],
      },
      {
        label: 'Relatórios',
        href: ROUTES.dashboard.relatorios,
        icon: BarChart3,
        roles: ['admin', 'secretaria', 'dentista'],
      },
      {
        label: 'Notificações',
        href: ROUTES.dashboard.notificacoes,
        icon: Bell,
        roles: ['admin', 'secretaria'],
      },
    ],
  },
  {
    title: 'Administração',
    items: [
      {
        label: 'Dentistas',
        href: ROUTES.dashboard.dentistas.list,
        icon: Stethoscope,
        roles: ['admin'],
      },
      {
        label: 'Procedimentos',
        href: ROUTES.dashboard.procedimentos.list,
        icon: FileText,
        roles: ['admin'],
      },
      {
        label: 'Usuários',
        href: ROUTES.dashboard.usuarios,
        icon: UserCog,
        roles: ['admin'],
      },
      {
        label: 'Logs',
        href: ROUTES.dashboard.logs,
        icon: ScrollText,
        roles: ['admin'],
      },
      {
        label: 'Configurações',
        href: ROUTES.dashboard.configuracoes,
        icon: Settings,
        roles: ['admin'],
      },
    ],
  },
]
