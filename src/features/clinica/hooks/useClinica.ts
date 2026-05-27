/**
 * useClinica — hook para leitura/atualização dos dados da clínica
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { clinicaService } from '../services/clinicaService'
import type { ClinicaData } from '../types/clinica.types'

interface UseClinicaReturn {
  clinica: ClinicaData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useClinica(clinicaId: string | null | undefined): UseClinicaReturn {
  const [clinica, setClinica] = useState<ClinicaData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClinica = useCallback(async () => {
    if (!clinicaId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await clinicaService.getClinica(clinicaId)
      setClinica(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados da clínica')
    } finally {
      setIsLoading(false)
    }
  }, [clinicaId])

  useEffect(() => {
    fetchClinica()
  }, [fetchClinica])

  return { clinica, isLoading, error, refetch: fetchClinica }
}
