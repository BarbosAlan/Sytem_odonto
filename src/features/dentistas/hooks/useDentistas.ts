/**
 * useDentistas — gerencia a lista de dentistas no client
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { dentistaService } from '../services/dentistaService'
import type { DentistaData } from '../types/dentista.types'

interface UseDentistasReturn {
  dentistas: DentistaData[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDentistas(clinicaId: string): UseDentistasReturn {
  const [dentistas, setDentistas] = useState<DentistaData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await dentistaService.listar(clinicaId)
      setDentistas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dentistas')
    } finally {
      setIsLoading(false)
    }
  }, [clinicaId])

  useEffect(() => {
    void fetch()
  }, [fetch])

  return { dentistas, isLoading, error, refetch: fetch }
}
