/**
 * AgendaPageClient — calendário principal com vistas Semana / Dia / Mês
 */
'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { useAgenda } from '../hooks/useAgenda'
import { NovoAgendamentoModal } from './NovoAgendamentoModal'
import { AgendamentoDetalheModal } from './AgendamentoDetalheModal'
import { agendaService } from '../services/agendaService'
import {
  isToday,
  isSameDay,
  formatDayOfWeek,
  formatDateShort,
  formatWeekRange,
  formatMonthYear,
  minuteOfDay,
  toDateInputValue,
  formatTime,
} from '../utils/dateUtils'
import type { AgendamentoComDetalhes, AgendaView, AgendamentoStatus } from '../types/agenda.types'
import { STATUS_COLORS } from '../types/agenda.types'

// ─── Constantes do calendário ─────────────────────────────────────────────────
const START_HOUR = 7
const END_HOUR = 20
const HOUR_HEIGHT = 80 // px por hora
const PX_PER_MIN = HOUR_HEIGHT / 60

function parseDate(iso: string): Date {
  return new Date(iso)
}

// ─── Componentes de calendário ────────────────────────────────────────────────

function CurrentTimeIndicator() {
  const now = new Date()
  const offset = (minuteOfDay(now) - START_HOUR * 60) * PX_PER_MIN
  if (offset < 0 || offset > (END_HOUR - START_HOUR) * HOUR_HEIGHT) return null
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
      style={{ top: offset }}
    >
      <div className="-ml-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
      <div className="flex-1 border-t-2 border-red-500" />
    </div>
  )
}

interface AppointmentBlockProps {
  appointment: AgendamentoComDetalhes
  onClick: (appt: AgendamentoComDetalhes) => void
}

function AppointmentBlock({ appointment: appt, onClick }: AppointmentBlockProps) {
  const startDate = parseDate(appt.data_hora)
  const startMin = minuteOfDay(startDate)
  const offsetMin = startMin - START_HOUR * 60
  if (offsetMin < 0 || offsetMin >= (END_HOUR - START_HOUR) * 60) return null

  const top = offsetMin * PX_PER_MIN + 1
  const height = Math.max(appt.duracao_minutos * PX_PER_MIN - 2, 18)
  const colors = STATUS_COLORS[appt.status]

  return (
    <div
      data-appointment="true"
      className={cn(
        'absolute left-1 right-1 overflow-hidden rounded cursor-pointer transition-opacity hover:opacity-80 border border-l-4',
        colors.bg,
        colors.text,
        colors.border,
      )}
      style={{ top, height, borderLeftColor: appt.dentista_cor }}
      onClick={(e) => {
        e.stopPropagation()
        onClick(appt)
      }}
    >
      <div className="px-1.5 py-0.5">
        <p className="truncate text-xs font-semibold leading-tight">
          {appt.paciente_nome ?? '—'}
        </p>
        {height > 30 && (
          <p className="truncate text-xs opacity-70">
            {formatTime(startDate)}
            {appt.procedimento_nome ? ` · ${appt.procedimento_nome}` : ''}
          </p>
        )}
      </div>
    </div>
  )
}

interface DayColumnProps {
  day: Date
  appointments: AgendamentoComDetalhes[]
  hours: number[]
  onSlotClick: (date: Date, hour: number, minute: number) => void
  onAppointmentClick: (appt: AgendamentoComDetalhes) => void
}

function DayColumn({ day, appointments, hours, onSlotClick, onAppointmentClick }: DayColumnProps) {
  const totalHeight = hours.length * HOUR_HEIGHT

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    if (target.closest('[data-appointment]')) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const minutesFromStart = clickY / PX_PER_MIN
    const snapped = Math.floor(minutesFromStart / 30) * 30
    const totalMin = START_HOUR * 60 + snapped
    const hour = Math.floor(totalMin / 60)
    const minute = totalMin % 60
    if (hour >= START_HOUR && hour < END_HOUR) {
      onSlotClick(day, hour, minute)
    }
  }

  return (
    <div
      className={cn(
        'relative flex-1 cursor-pointer border-l border-gray-200',
        isToday(day) && 'bg-blue-50/30',
      )}
      style={{ height: totalHeight }}
      onClick={handleClick}
    >
      {/* Linhas de hora e meia-hora */}
      {hours.map((_, i) => (
        <div key={i}>
          <div
            className="pointer-events-none absolute w-full border-t border-gray-200"
            style={{ top: i * HOUR_HEIGHT }}
          />
          <div
            className="pointer-events-none absolute w-full border-t border-gray-100"
            style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
          />
        </div>
      ))}

      {isToday(day) && <CurrentTimeIndicator />}

      {appointments.map((appt) => (
        <AppointmentBlock
          key={appt.id}
          appointment={appt}
          onClick={onAppointmentClick}
        />
      ))}
    </div>
  )
}

interface WeekViewProps {
  days: Date[]
  agendamentos: AgendamentoComDetalhes[]
  isLoading: boolean
  onSlotClick: (date: Date, hour: number, minute: number) => void
  onAppointmentClick: (appt: AgendamentoComDetalhes) => void
}

function WeekView({ days, agendamentos, isLoading, onSlotClick, onAppointmentClick }: WeekViewProps) {
  const hours = useMemo(
    () => Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i),
    []
  )
  const totalHeight = hours.length * HOUR_HEIGHT

  const apptsByDay = useMemo(() => {
    const map = new Map<string, AgendamentoComDetalhes[]>()
    days.forEach((d) => map.set(d.toDateString(), []))
    agendamentos.forEach((a) => {
      const key = parseDate(a.data_hora).toDateString()
      map.get(key)?.push(a)
    })
    return map
  }, [days, agendamentos])

  return (
    <div className="flex h-full flex-col">
      {/* Cabeçalho dos dias */}
      <div className="sticky top-0 z-10 flex border-b border-gray-200 bg-white">
        <div className="w-12 flex-shrink-0 border-r border-gray-200" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              'flex-1 border-l border-gray-200 py-2 text-center',
              isToday(day) && 'bg-blue-50',
            )}
          >
            <p className="text-xs font-medium uppercase text-gray-400">
              {formatDayOfWeek(day)}
            </p>
            <p
              className={cn(
                'mt-0.5 text-sm font-semibold',
                isToday(day) ? 'text-blue-600' : 'text-gray-900',
              )}
            >
              {day.getDate()}
            </p>
          </div>
        ))}
      </div>

      {/* Grade de horários */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <div className="flex" style={{ height: totalHeight }}>
            {/* Coluna de horas */}
            <div className="relative w-12 flex-shrink-0 border-r border-gray-200">
              {hours.map((hour, i) => (
                <span
                  key={hour}
                  className="absolute right-2 text-right text-xs text-gray-400"
                  style={{ top: i * HOUR_HEIGHT - 7 }}
                >
                  {String(hour).padStart(2, '0')}h
                </span>
              ))}
            </div>

            {/* Colunas de dias */}
            {days.map((day) => (
              <DayColumn
                key={day.toISOString()}
                day={day}
                appointments={apptsByDay.get(day.toDateString()) ?? []}
                hours={hours}
                onSlotClick={onSlotClick}
                onAppointmentClick={onAppointmentClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface MonthViewProps {
  currentDate: Date
  days: Date[]
  agendamentos: AgendamentoComDetalhes[]
  isLoading: boolean
  onDayClick: (date: Date) => void
  onAppointmentClick: (appt: AgendamentoComDetalhes) => void
  setView: (v: AgendaView) => void
}

function MonthView({ currentDate, days, agendamentos, isLoading, onDayClick, onAppointmentClick, setView }: MonthViewProps) {
  const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  const apptsByDay = useMemo(() => {
    const map = new Map<string, AgendamentoComDetalhes[]>()
    agendamentos.forEach((a) => {
      const key = parseDate(a.data_hora).toDateString()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(a)
    })
    return map
  }, [agendamentos])

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-white sticky top-0 z-10">
        {DAY_NAMES.map((n) => (
          <div key={n} className="py-2 text-center text-xs font-medium uppercase text-gray-400">
            {n}
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-7 divide-x divide-y divide-gray-200">
          {days.map((day) => {
            const dayAppts = apptsByDay.get(day.toDateString()) ?? []
            const inMonth = day.getMonth() === currentDate.getMonth()
            const today = isToday(day)
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-h-[100px] cursor-pointer p-1.5 hover:bg-gray-50 transition-colors',
                  !inMonth && 'bg-gray-50/70',
                )}
                onClick={() => { onDayClick(day); setView('day') }}
              >
                <div
                  className={cn(
                    'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium',
                    today ? 'bg-blue-600 text-white' : inMonth ? 'text-gray-900' : 'text-gray-400',
                  )}
                >
                  {day.getDate()}
                </div>
                {dayAppts.slice(0, 3).map((appt) => {
                  const c = STATUS_COLORS[appt.status]
                  return (
                    <div
                      key={appt.id}
                      className={cn(
                        'mb-0.5 truncate rounded border-l-2 px-1.5 py-0.5 text-xs cursor-pointer hover:opacity-80',
                        c.bg,
                        c.text,
                      )}
                      style={{ borderLeftColor: appt.dentista_cor }}
                      onClick={(e) => { e.stopPropagation(); onAppointmentClick(appt) }}
                    >
                      {formatTime(parseDate(appt.data_hora))} {appt.paciente_nome ?? '—'}
                    </div>
                  )
                })}
                {dayAppts.length > 3 && (
                  <p className="px-1 text-xs text-gray-400">+{dayAppts.length - 3} mais</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface AgendaPageClientProps {
  clinicaId: string
}

export function AgendaPageClient({ clinicaId }: AgendaPageClientProps) {
  const {
    view,
    setView,
    currentDate,
    setCurrentDate,
    dentistaFilter,
    setDentistaFilter,
    agendamentos,
    dentistas,
    procedimentos,
    isLoading,
    error,
    refetch,
    navigate,
    weekDays,
    monthDays,
  } = useAgenda({ clinicaId })

  const [novoModal, setNovoModal] = useState<{
    open: boolean
    data?: string
    hora?: string
    dentistaId?: string
  }>({ open: false })

  const [detalheModal, setDetalheModal] = useState<{
    open: boolean
    agendamento?: AgendamentoComDetalhes
  }>({ open: false })

  function handleSlotClick(date: Date, hour: number, minute: number) {
    const h = String(hour).padStart(2, '0')
    const m = String(minute).padStart(2, '0')
    setNovoModal({
      open: true,
      data: toDateInputValue(date),
      hora: `${h}:${m}`,
      dentistaId: dentistaFilter ?? undefined,
    })
  }

  function handleAppointmentClick(appt: AgendamentoComDetalhes) {
    setDetalheModal({ open: true, agendamento: appt })
  }

  async function handleStatusChange(id: string, status: AgendamentoStatus) {
    await agendaService.alterarStatus(id, status)
    await refetch()
    setDetalheModal({ open: false })
  }

  async function handleDelete(id: string) {
    await agendaService.excluir(id)
    await refetch()
    setDetalheModal({ open: false })
  }

  // Label do período exibido
  const periodLabel = useMemo(() => {
    if (view === 'week') return formatWeekRange(weekDays[0])
    if (view === 'day') {
      return `${formatDayOfWeek(currentDate)}, ${formatDateShort(currentDate)} ${currentDate.getFullYear()}`
    }
    return formatMonthYear(currentDate)
  }, [view, currentDate, weekDays])

  const displayDays = view === 'day' ? [currentDate] : weekDays

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Navegação */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('prev')}
            className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate('today')}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={() => navigate('next')}
            className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="ml-1 text-sm font-semibold text-gray-900">{periodLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro de dentista */}
          <select
            value={dentistaFilter ?? ''}
            onChange={(e) => setDentistaFilter(e.target.value || null)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os dentistas</option>
            {dentistas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>

          {/* Alternador de vista */}
          <div className="flex overflow-hidden rounded-lg border border-gray-200">
            {(['week', 'day', 'month'] as AgendaView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium transition-colors',
                  view === v ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50',
                )}
              >
                {v === 'week' ? 'Semana' : v === 'day' ? 'Dia' : 'Mês'}
              </button>
            ))}
          </div>

          {/* Novo agendamento */}
          <button
            onClick={() => setNovoModal({ open: true })}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo
          </button>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error} —{' '}
          <button onClick={refetch} className="underline">
            tentar novamente
          </button>
        </div>
      )}

      {/* Calendário */}
      <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {view === 'month' ? (
          <MonthView
            currentDate={currentDate}
            days={monthDays}
            agendamentos={agendamentos}
            isLoading={isLoading}
            onDayClick={setCurrentDate}
            onAppointmentClick={handleAppointmentClick}
            setView={setView}
          />
        ) : (
          <WeekView
            days={displayDays}
            agendamentos={agendamentos}
            isLoading={isLoading}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        )}
      </div>

      {/* Legenda de dentistas */}
      {dentistas.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-1">
          <span className="text-xs text-gray-400">Dentistas:</span>
          {dentistas.map((d) => (
            <button
              key={d.id}
              onClick={() => setDentistaFilter(dentistaFilter === d.id ? null : d.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                dentistaFilter === d.id
                  ? 'ring-2 ring-offset-1'
                  : 'hover:bg-gray-100',
              )}
            >
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: d.cor }}
              />
              {d.nome}
            </button>
          ))}
        </div>
      )}

      {/* Modais */}
      <NovoAgendamentoModal
        open={novoModal.open}
        onClose={() => setNovoModal({ open: false })}
        onSuccess={refetch}
        clinicaId={clinicaId}
        initialData={novoModal.open ? {
          data: novoModal.data,
          hora: novoModal.hora,
          dentistaId: novoModal.dentistaId,
        } : undefined}
        dentistas={dentistas}
        procedimentos={procedimentos}
      />

      <AgendamentoDetalheModal
        open={detalheModal.open}
        agendamento={detalheModal.agendamento}
        onClose={() => setDetalheModal({ open: false })}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  )
}
