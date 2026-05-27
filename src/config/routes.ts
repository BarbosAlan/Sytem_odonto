/**
 * Rotas centralizadas do sistema
 * Nunca use strings hardcoded de rotas no código — importe daqui.
 */

export const ROUTES = {
  // Rotas públicas
  auth: {
    login: '/login',
    resetPassword: '/reset-password',
    primeiroAcesso: '/primeiro-acesso',
  },

  // Rotas protegidas (prefixo /dashboard)
  dashboard: {
    home: '/dashboard',

    pacientes: {
      list: '/dashboard/pacientes',
      new: '/dashboard/pacientes/novo',
      detail: (id: string) => `/dashboard/pacientes/${id}`,
      edit: (id: string) => `/dashboard/pacientes/${id}/editar`,
    },

    dentistas: {
      list: '/dashboard/dentistas',
      new: '/dashboard/dentistas/novo',
      detail: (id: string) => `/dashboard/dentistas/${id}`,
      edit: (id: string) => `/dashboard/dentistas/${id}/editar`,
      agenda: (id: string) => `/dashboard/dentistas/${id}/agenda`,
    },

    procedimentos: {
      list: '/dashboard/procedimentos',
      new: '/dashboard/procedimentos/novo',
      edit: (id: string) => `/dashboard/procedimentos/${id}/editar`,
    },

    agenda: '/dashboard/agenda',

    agendamentos: {
      list: '/dashboard/agendamentos',
      new: '/dashboard/agendamentos/novo',
      detail: (id: string) => `/dashboard/agendamentos/${id}`,
      edit: (id: string) => `/dashboard/agendamentos/${id}/editar`,
    },

    prontuarios: {
      list: '/dashboard/prontuarios',
      detail: (id: string) => `/dashboard/prontuarios/${id}`,
      new: (pacienteId: string) => `/dashboard/prontuarios/novo?pacienteId=${pacienteId}`,
    },

    anexos: '/dashboard/anexos',

    financeiro: {
      list: '/dashboard/financeiro',
      new: '/dashboard/financeiro/novo',
    },

    relatorios: '/dashboard/relatorios',
    notificacoes: '/dashboard/notificacoes',
    logs: '/dashboard/logs',
    usuarios: '/dashboard/usuarios',
    configuracoes: '/dashboard/configuracoes',
  },
} as const
