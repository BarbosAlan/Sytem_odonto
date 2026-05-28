/**
 * AgendamentoEditarModal — formulário de edição de agendamento existente
 */
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { agendamentosService } from '../services/agendamentosService'
import { agendaService } from '@/features/agenda/services/agendaService'
import { agendamentoSchema, agendamentoDefaultValues } from '@/features/agenda/validations/agendamento.schemas'
import type { AgendamentoFormValues } from '@/features/agenda/validations/agendamento.schemas'
import type {
  AgendamentoComDetalhes,
  DentistaOption,
  PacienteOption,
  ProcedimentoOption,
} from '../types/agendamentos.types'
import { AGENDAMENTO_STATUS, STATUS_LABELS } from '@/features/agenda/types/agenda.types'
import {
  toISODateTime,
  toDateInputValue,
  formatTime,
  parseISO,
} from '@/features/agenda/utils/dateUtils'

interface AgendamentoEditarModalProps {
  open: boolean
  agendamento?: AgendamentoComDetalhes
  onClose: () => void
  onSuccess: () => void
  clinicaId: string
  dentistas: DentistaOption[]
  procedimentos: ProcedimentoOption[]
}

export function AgendamentoEditarModal({
  open,
  agendamento,
  onClose,
  onSuccess,
  clinicaId,
  dentistas,
  procedimentos,
}: AgendamentoEditarModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AgendamentoFormValues>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: agendamentoDefaultValues,
  })

  // Combobox de paciente
  const [pacienteNome, setPacienteNome] = useState('')
  const [pacienteOptions, setPacienteOptions] = useState<PacienteOption[]>([])
  const [pacienteDropdownOpen, setPacienteDropdownOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const comboboxRef = useRef<HTMLDivElement>(null)

  const procedimentoId = watch('procedimento_id')

  // Fecha dropdown ao clicar fora do combobox
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setPacienteDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Preenche o formulário com os dados do agendamento ao abrir
  useEffect(() => {
    if (open && agendamento) {
      const apptDate = parseISO(agendamento.data_hora)
      reset({
        paciente_id: agendamento.paciente_id ?? '',
        dentista_id: agendamento.dentista_id,
        procedimento_id: agendamento.procedimento_id ?? '',
        data: toDateInputValue(apptDate),
        hora: formatTime(apptDate),
        duracao_minutos: agendamento.duracao_minutos,
        status: agendamento.status,
        observacoes: agendamento.observacoes ?? '',
      })
      setPacienteNome(agendamento.paciente_nome ?? '')
      setPacienteOptions([])
      setPacienteDropdownOpen(false)
    }
  }, [open, agendamento, reset])

  // Preenche duração automaticamente ao selecionar procedimento
  useEffect(() => {
    if (procedimentoId) {
      const proc = procedimentos.find((p) => p.id === procedimentoId)
      if (proc) setValue('duracao_minutos', proc.duracao_minutos)
    }
  }, [procedimentoId, procedimentos, setValue])

  const handlePacienteSearch = useCallback(
    (value: string) => {
      setPacienteNome(value)
      setValue('paciente_id', '') // limpa o ID ao digitar novo nome
      clearTimeout(searchTimeout.current)

      if (value.length < 2) {
        setPacienteDropdownOpen(false)
        setPacienteOptions([])
        return
      }

      setIsSearching(true)
      searchTimeout.current = setTimeout(async () => {
        try {
          const results = await agendaService.buscarPacientes(clinicaId, value)
          setPacienteOptions(results)
          setPacienteDropdownOpen(true)
        } catch {
          setPacienteOptions([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
    },
    [clinicaId, setValue]
  )

  function handlePacienteSelect(paciente: PacienteOption) {
    setValue('paciente_id', paciente.id)
    setPacienteNome(paciente.nome)
    setPacienteDropdownOpen(false)
  }

  async function onSubmit(values: AgendamentoFormValues) {
    if (!agendamento) return
    try {
      await agendamentosService.atualizar(agendamento.id, {
        paciente_id: values.paciente_id || null,
        dentista_id: values.dentista_id,
        procedimento_id: values.procedimento_id || null,
        data_hora: toISODateTime(values.data, values.hora),
        duracao_minutos: values.duracao_minutos,
        status: values.status,
        observacoes: values.observacoes || null,
      })
      toast.success('Agendamento atualizado com sucesso!')
      onSuccess()
      onClose()
    } catch {
      toast.error('Erro ao atualizar agendamento. Tente novamente.')
    }
  }

  if (!open || !agendamento) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Faixa de cor do dentista atual */}
        <div
          className="h-0.5 w-full"
          style={{ backgroundColor: agendamento.dentista_cor }}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Editar Agendamento</h2>
            {agendamento.paciente_nome && (
              <p className="mt-0.5 text-sm text-gray-500">{agendamento.paciente_nome}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[80vh] overflow-y-auto">
          <div className="space-y-4 p-6">
            {/* Paciente (combobox) */}
            <div ref={comboboxRef} className="relative">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Paciente
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={pacienteNome}
                  onChange={(e) => handlePacienteSearch(e.target.value)}
                  placeholder="Buscar paciente..."
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoComplete="off"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                )}
              </div>

              {pacienteDropdownOpen && pacienteOptions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  {pacienteOptions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
                      onMouseDown={() => handlePacienteSelect(p)}
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {p.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.nome}</p>
                        {p.cpf && (
                          <p className="text-xs text-gray-400">CPF: {p.cpf}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {pacienteDropdownOpen && pacienteOptions.length === 0 && !isSearching && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                  <p className="text-center text-sm text-gray-400">
                    Nenhum paciente encontrado
                  </p>
                </div>
              )}
            </div>

            {/* Dentista */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Dentista <span className="text-red-500">*</span>
              </label>
              <select
                {...register('dentista_id')}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                {dentistas.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
              </select>
              {errors.dentista_id && (
                <p className="mt-1 text-xs text-red-600">{errors.dentista_id.message}</p>
              )}
            </div>

            {/* Procedimento */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Procedimento
              </label>
              <select
                {...register('procedimento_id')}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Não especificado</option>
                {procedimentos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Data + Hora */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Data <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('data')}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.data && (
                  <p className="mt-1 text-xs text-red-600">{errors.data.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Horário <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  {...register('hora')}
                  step="900"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.hora && (
                  <p className="mt-1 text-xs text-red-600">{errors.hora.message}</p>
                )}
              </div>
            </div>

            {/* Duração + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Duração (min) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('duracao_minutos', { valueAsNumber: true })}
                  min={5}
                  max={480}
                  step={5}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.duracao_minutos && (
                  <p className="mt-1 text-xs text-red-600">{errors.duracao_minutos.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {AGENDAMENTO_STATUS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Observações
              </label>
              <textarea
                {...register('observacoes')}
                rows={3}
                placeholder="Informações adicionais..."
                className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
