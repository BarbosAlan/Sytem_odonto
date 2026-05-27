/**
 * Dashboard Home — /dashboard
 * Placeholder com KPIs. Será populado no Módulo 12 (Relatórios + Dashboard).
 */
import type { Metadata } from 'next'
import {
  CalendarDays,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/services/supabase/server'

export const metadata: Metadata = {
  title: 'Dashboard | OdontoSystem',
}

interface KpiCardProps {
  title: string
  value: string
  description: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
}

function KpiCard({ title, value, description, icon: Icon, iconColor, iconBg }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="mt-1 text-xs text-gray-400">{description}</p>
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Busca o perfil para saudação personalizada
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: perfil } = await (supabase as any)
    .from('perfis')
    .select('nome')
    .eq('id', user!.id)
    .single() as { data: { nome: string } | null }

  const firstName = perfil?.nome?.split(' ')[0] ?? 'Usuário'

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Olá, {firstName}! 👋
        </h2>
        <p className="mt-1 text-gray-500">
          Aqui está o resumo de hoje —{' '}
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Consultas Hoje"
          value="—"
          description="Disponível após configurar agenda"
          icon={CalendarDays}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <KpiCard
          title="Pacientes Ativos"
          value="—"
          description="Disponível após cadastrar pacientes"
          icon={Users}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <KpiCard
          title="Receita do Mês"
          value="—"
          description="Disponível após lançamentos financeiros"
          icon={DollarSign}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-50"
        />
        <KpiCard
          title="Taxa de Confirmação"
          value="—"
          description="Disponível após agendamentos"
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Próximas consultas (placeholder) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-blue-600" />
              Próximas Consultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarDays className="mb-3 h-10 w-10 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">
                Nenhuma consulta agendada
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Os agendamentos aparecerão aqui
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Pendências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="mb-3 h-10 w-10 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">
                Nenhuma pendência
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Confirmações e alertas aparecerão aqui
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aviso de setup */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-start gap-3 pt-6">
          <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">Sistema configurado com sucesso!</p>
            <p className="mt-1 text-xs text-blue-700">
              Para começar a usar: configure a clínica, cadastre dentistas, procedimentos e pacientes.
              Os dados do dashboard serão populados conforme você usa o sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
