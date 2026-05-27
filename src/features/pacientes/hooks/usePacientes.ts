/**
 * usePacientes — lista de pacientes com busca client-side
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { pacienteService } from '../services/pacienteService'
import type { PacienteData } from '../types/paciente.types'

interface UsePacientesReturn {
  pacientes: PacienteData[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function usePacientes(clinicaId: string): UsePacientesReturn {
  const [pacientes, setPacientes] = useState<PacienteData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await pacienteService.listar(clinicaId)
      setPacientes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pacientes')
    } finally {
      setIsLoading(false)
    }
  }, [clinicaId])

  useEffect(() => {
    void fetch()
  }, [fetch])

  return { pacientes, isLoading, error, refetch: fetch }
}
