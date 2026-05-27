/**
 * AgendamentoDetalheModal — visualização e ações rápidas de um agendamento
 */
'use client'

import { useState } from 'react'
import { X, Clock, User, Stethoscope, FileText, CheckCircle2, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import type { AgendamentoComDetalhes, AgendamentoStatus } from '../types/agenda.types'
import { STATUS_LABELS, STATUS_COLORS, AGENDAMENTO_STATUS } from '../types/agenda.types'
import { formatDate, formatTime, formatDuracao, parseISO } from '../utils/dateUtils'

// Transições de status permitidas
const TRANSICOES: Partial<Record<AgendamentoStatus, AgendamentoStatus[]>> = {
  agendado: ['confirmado', 'cancelado'],
  confirmado: ['em_atendimento', 'cancelado'],
  em_atendimento: ['concluido', 'faltou'],
  cancelado: ['agendado'],
  faltou: ['agendado'],
  concluido: [],
}

interface AgendamentoDetalheModalProps {
  open: boolean
  agendamento?: AgendamentoComDetalhes
  onClose: () => void
  onStatusChange: (id: string, status: AgendamentoStatus) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function AgendamentoDetalheModal({
  open,
  agendamento: appt,
  onClose,
  onStatusChange,
  onDelete,
}: AgendamentoDetalheModalProps) {
  const [loadingStatus, setLoadingStatus] = useState<AgendamentoStatus | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!open || !appt) return null

  const startDate = parseISO(appt.data_hora)
  const colors = STATUS_COLORS[appt.status]
  const nextStatuses = TRANSICOES[appt.status] ?? []

  async function handleStatusChange(status: AgendamentoStatus) {
    setLoadingStatus(status)
    try {
      await onStatusChange(appt!.id, status)
      toast.success(`Status alterado para ${STATUS_LABELS[status]}`)
    } catch {
      toast.error('Erro ao alterar status')
    } finally {
      setLoadingStatus(null)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setIsDeleting(true)
    try {
      await onDelete(appt!.id)
      toast.success('Agendamento excluído')
    } catch {
      toast.error('Erro ao excluir agendamento')
      setIsDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Stripe de cor do dentista */}
        <div className="h-1 w-full" style={{ backgroundColor: appt.dentista_cor }} />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {appt.paciente_nome ?? 'Paciente não informado'}
            </h2>
            <span
              className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
              {STATUS_LABELS[appt.status]}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Detalhes */}
        <div className="space-y-3 px-6 pb-4">
          <DetailRow icon={<Clock className="h-4 w-4" />}>
            <span className="font-medium">{formatDate(startDate)}</span>
            <span className="mx-1 text-gray-300">·</span>
            <span>{formatTime(startDate)}</span>
            <span className="mx-1 text-gray-300">·</span>
            <span className="text-gray-500">{formatDuracao(appt.duracao_minutos)}</span>
          </DetailRow>

          <DetailRow icon={<Stethoscope className="h-4 w-4" />}>
            <span style={{ color: appt.dentista_cor }} className="font-medium">
              {appt.dentista_nome}
            </span>
          </DetailRow>

          {appt.procedimento_nome && (
            <DetailRow icon={<FileText className="h-4 w-4" />}>
              <span>{appt.procedimento_nome}</span>
            </DetailRow>
          )}

          {appt.paciente_cpf && (
            <DetailRow icon={<User className="h-4 w-4" />}>
              <span className="text-gray-500">CPF: {appt.paciente_cpf}</span>
            </DetailRow>
          )}

          {appt.observacoes && (
            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              {appt.observacoes}
            </div>
          )}
        </div>

        {/* Ações de status */}
        {nextStatuses.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-gray-100 px-6 py-4">
            {nextStatuses.map((status) => {
              const sc = STATUS_COLORS[status]
              const isLoading = loadingStatus === status
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={loadingStatus !== null}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${sc.bg} ${sc.text} ${sc.border}`}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  {STATUS_LABELS[status]}
                </button>
              )
            })}
          </div>
        )}

        {/* Rodapé: excluir */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
          <div className="text-xs text-gray-400">
            Criado em {formatDate(parseISO(appt.created_at))}
          </div>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">Confirmar exclusão?</span>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
              >
                Não
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="h-3 w-3 animate-spin" />}
                Excluir
              </button>
            </div>
          ) : (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-gray-700">
      <span className="flex-shrink-0 text-gray-400">{icon}</span>
      {children}
    </div>
  )
}

