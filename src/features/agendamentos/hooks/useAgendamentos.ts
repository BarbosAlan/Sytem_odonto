/**
 * useAgendamentos — dados e estado da página de listagem de agendamentos
 */
'use client'

import { useState, useEffect, useCallback } from 'react'

import { agendamentosService } from '../services/agendamentosService'
import { agendaService } from '@/features/agenda/services/agendaService'
import type {
  AgendamentoComDetalhes,
  DentistaOption,
  ProcedimentoOption,
  FiltrosAgendamentos,
} from '../types/agendamentos.types'
import { filtrosDefault, POR_PAGINA } from '../types/agendamentos.types'

interface UseAgendamentosProps {
  clinicaId: string
}

export function useAgendamentos({ clinicaId }: UseAgendamentosProps) {
  const [agendamentos, setAgendamentos] = useState<AgendamentoComDetalhes[]>([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosAgendamentos>(filtrosDefault)
  const [dentistas, setDentistas] = useState<DentistaOption[]>([])
  const [procedimentos, setProcedimentos] = useState<ProcedimentoOption[]>([])

  // Carrega listas de suporte (usadas nos selects dos modais)
  useEffect(() => {
    agendaService.listarDentistas(clinicaId).then(setDentistas).catch(() => {})
    agendaService.listarProcedimentos(clinicaId).then(setProcedimentos).catch(() => {})
  }, [clinicaId])

  const carregar = useCallback(
    async (p: number, f: FiltrosAgendamentos) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await agendamentosService.listarComFiltros(clinicaId, f, p, POR_PAGINA)
        setAgendamentos(result.data)
        setTotal(result.total)
      } catch {
        setError('Erro ao carregar agendamentos.')
      } finally {
        setIsLoading(false)
      }
    },
    [clinicaId]
  )

  useEffect(() => {
    carregar(pagina, filtros)
  }, [pagina, filtros, carregar])

  function aplicarFiltros(novosFiltros: FiltrosAgendamentos) {
    setPagina(1) // volta para a primeira página ao filtrar
    setFiltros(novosFiltros)
  }

  function limparFiltros() {
    setPagina(1)
    setFiltros(filtrosDefault)
  }

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA))

  return {
    agendamentos,
    total,
    pagina,
    setPagina,
    totalPaginas,
    isLoading,
    error,
    filtros,
    aplicarFiltros,
    limparFiltros,
    dentistas,
    procedimentos,
    refetch: () => carregar(pagina, filtros),
  }
}
