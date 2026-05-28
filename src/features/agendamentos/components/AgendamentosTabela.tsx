/**
 * AgendamentosTabela — tabela de agendamentos com ações inline
 */
'use client'

import { useState } from 'react'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { agendamentosService } from '../services/agendamentosService'
import type { AgendamentoComDetalhes, AgendamentoStatus } from '../types/agendamentos.types'
import { STATUS_LABELS, STATUS_COLORS } from '@/features/agenda/types/agenda.types'
import {
  formatDate,
  formatTime,
  formatDuracao,
  parseISO,
} from '@/features/agenda/utils/dateUtils'

// Transições de status permitidas (mesma regra do módulo Agenda)
const TRANSICOES: Partial<Record<AgendamentoStatus, AgendamentoStatus[]>> = {
  agendado: ['confirmado', 'cancelado'],
  confirmado: ['em_atendimento', 'cancelado'],
  em_atendimento: ['concluido', 'faltou'],
  cancelado: ['agendado'],
  faltou: ['agendado'],
  concluido: [],
}

interface AgendamentosTabelaProps {
  agendamentos: AgendamentoComDetalhes[]
  onEditar: (agendamento: AgendamentoComDetalhes) => void
  onRefetch: () => void
}

export function AgendamentosTabela({
  agendamentos,
  onEditar,
  onRefetch,
}: AgendamentosTabelaProps) {
  const [loadingStatusId, setLoadingStatusId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleStatusChange(id: string, status: AgendamentoStatus) {
    setLoadingStatusId(id)
    try {
      await agendamentosService.alterarStatus(id, status)
      toast.success(`Status alterado para "${STATUS_LABELS[status]}"`)
      onRefetch()
    } catch {
      toast.error('Erro ao alterar status')
    } finally {
      setLoadingStatusId(null)
    }
  }

  async function handleDelete(id: string) {
    // Primeiro clique: pede confirmação; segundo clique: executa
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id)
      return
    }
    setDeletingId(id)
    try {
      await agendamentosService.excluir(id)
      toast.success('Agendamento excluído')
      setDeleteConfirmId(null)
      onRefetch()
    } catch {
      toast.error('Erro ao excluir agendamento')
      setDeletingId(null)
      setDeleteConfirmId(null)
    }
  }

  if (agendamentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-3 text-4xl">📅</div>
        <p className="text-sm font-medium text-gray-900">Nenhum agendamento encontrado</p>
        <p className="mt-1 text-sm text-gray-400">
          Tente ajustar os filtros ou crie um novo agendamento.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              Data / Hora
            </th>
            <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              Paciente
            </th>
            <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              Dentista
            </th>
            <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-gray-400 hidden md:table-cell">
              Procedimento
            </th>
            <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-gray-400 hidden lg:table-cell">
              Duração
            </th>
            <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              Status
            </th>
            <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-gray-400">
              Ações
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {agendamentos.map((a) => {
            const apptDate = parseISO(a.data_hora)
            const colors = STATUS_COLORS[a.status]
            const nextStatuses = TRANSICOES[a.status] ?? []
            const isLoadingStatus = loadingStatusId === a.id
            const isConfirmingDelete = deleteConfirmId === a.id
            const isDeletingThis = deletingId === a.id

            return (
              <tr
                key={a.id}
                className="group transition-colors hover:bg-gray-50/70"
              >
                {/* Data / Hora */}
                <td className="py-3.5 pr-4">
                  <div className="font-medium text-gray-900">{formatDate(apptDate)}</div>
                  <div className="mt-0.5 text-xs text-gray-400">{formatTime(apptDate)}</div>
                </td>

                {/* Paciente */}
                <td className="py-3.5 pr-4">
                  {a.paciente_nome ? (
                    <div>
                      <div className="font-medium text-gray-900">{a.paciente_nome}</div>
                      {a.paciente_cpf && (
                        <div className="mt-0.5 text-xs text-gray-400">
                          CPF: {a.paciente_cpf}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>

                {/* Dentista */}
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: a.dentista_cor }}
                    />
                    <span className="font-medium text-gray-900">{a.dentista_nome}</span>
                  </div>
                </td>

                {/* Procedimento */}
                <td className="py-3.5 pr-4 hidden md:table-cell">
                  {a.procedimento_nome ? (
                    <span className="text-gray-700">{a.procedimento_nome}</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>

                {/* Duração */}
                <td className="py-3.5 pr-4 hidden lg:table-cell">
                  <span className="text-gray-600">{formatDuracao(a.duracao_minutos)}</span>
                </td>

                {/* Status */}
                <td className="py-3.5 pr-4">
                  {isLoadingStatus ? (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Atualizando...</span>
                    </div>
                  ) : nextStatuses.length > 0 ? (
                    // Status com transições: exibe um select
                    <select
                      value={a.status}
                      onChange={(e) =>
                        handleStatusChange(a.id, e.target.value as AgendamentoStatus)
                      }
                      disabled={loadingStatusId !== null}
                      className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-xs font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                      <option value={a.status}>{STATUS_LABELS[a.status]}</option>
                      {nextStatuses.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    // Status final: badge estático
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                      {STATUS_LABELS[a.status]}
                    </span>
                  )}
                </td>

                {/* Ações */}
                <td className="py-3.5">
                  <div className="flex items-center justify-end gap-0.5">
                    {isConfirmingDelete ? (
                      // Confirmação de exclusão inline
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-red-600">Confirmar?</span>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="rounded px-1.5 py-0.5 text-xs text-gray-500 hover:bg-gray-100"
                        >
                          Não
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          disabled={isDeletingThis}
                          className="flex items-center gap-0.5 rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          {isDeletingThis && (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          )}
                          Sim
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => onEditar(a)}
                          className="rounded-lg p-1.5 text-gray-400 opacity-0 transition-all hover:bg-blue-50 hover:text-blue-600 group-hover:opacity-100"
                          title="Editar agendamento"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="rounded-lg p-1.5 text-gray-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                          title="Excluir agendamento"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
