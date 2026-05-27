/**
 * useAgenda — estado e dados do calendário
 */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { agendaService } from '../services/agendaService'
import type {
  AgendamentoComDetalhes,
  DentistaOption,
  ProcedimentoOption,
  AgendaView,
} from '../types/agenda.types'
import {
  startOfWeek,
  addDays,
  startOfDay,
  endOfDay,
  getWeekDays,
  getMonthCalendarDays,
} from '../utils/dateUtils'

interface UseAgendaProps {
  clinicaId: string
}

export function useAgenda({ clinicaId }: UseAgendaProps) {
  const [view, setView] = useState<AgendaView>('week')
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [dentistaFilter, setDentistaFilter] = useState<string | null>(null)
  const [agendamentos, setAgendamentos] = useState<AgendamentoComDetalhes[]>([])
  const [dentistas, setDentistas] = useState<DentistaOption[]>([])
  const [procedimentos, setProcedimentos] = useState<ProcedimentoOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dateRange = useMemo(() => {
    if (view === 'day') {
      return {
        inicio: startOfDay(currentDate).toISOString(),
        fim: endOfDay(currentDate).toISOString(),
      }
    }
    if (view === 'week') {
      const monday = startOfWeek(currentDate)
      const sunday = addDays(monday, 6)
      return {
        inicio: startOfDay(monday).toISOString(),
        fim: endOfDay(sunday).toISOString(),
      }
    }
    // month
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    return {
      inicio: startOfDay(firstDay).toISOString(),
      fim: endOfDay(lastDay).toISOString(),
    }
  }, [view, currentDate])

  const loadAgendamentos = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await agendaService.listarPorPeriodo(
        clinicaId,
        dateRange.inicio,
        dateRange.fim,
        dentistaFilter
      )
      setAgendamentos(data)
    } catch (err) {
      setError('Erro ao carregar agendamentos')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [clinicaId, dateRange, dentistaFilter])

  // Carrega dentistas e procedimentos uma vez
  useEffect(() => {
    async function loadOptions() {
      try {
        const [d, p] = await Promise.all([
          agendaService.listarDentistas(clinicaId),
          agendaService.listarProcedimentos(clinicaId),
        ])
        setDentistas(d)
        setProcedimentos(p)
      } catch {
        // não-fatal
      }
    }
    loadOptions()
  }, [clinicaId])

  useEffect(() => {
    loadAgendamentos()
  }, [loadAgendamentos])

  function navigate(direction: 'prev' | 'next' | 'today') {
    if (direction === 'today') {
      setCurrentDate(new Date())
      return
    }
    const delta = direction === 'next' ? 1 : -1
    setCurrentDate((prev) => {
      const d = new Date(prev)
      if (view === 'day') d.setDate(d.getDate() + delta)
      else if (view === 'week') d.setDate(d.getDate() + delta * 7)
      else d.setMonth(d.getMonth() + delta)
      return d
    })
  }

  return {
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
    refetch: loadAgendamentos,
    navigate,
    weekDays: getWeekDays(currentDate),
    monthDays: getMonthCalendarDays(currentDate),
  }
}
