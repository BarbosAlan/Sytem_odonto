/**
 * useProcedimentos — gerencia a lista de procedimentos no client
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { procedimentoService } from '../services/procedimentoService'
import type { ProcedimentoData } from '../types/procedimento.types'

interface UseProcedimentosReturn {
  procedimentos: ProcedimentoData[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useProcedimentos(clinicaId: string): UseProcedimentosReturn {
  const [procedimentos, setProcedimentos] = useState<ProcedimentoData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await procedimentoService.listar(clinicaId)
      setProcedimentos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar procedimentos')
    } finally {
      setIsLoading(false)
    }
  }, [clinicaId])

  useEffect(() => {
    void fetch()
  }, [fetch])

  return { procedimentos, isLoading, error, refetch: fetch }
}
