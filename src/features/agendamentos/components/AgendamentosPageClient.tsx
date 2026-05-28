/**
 * AgendamentosPageClient — listagem de agendamentos com filtros, paginação e ações
 */
'use client'

import { useState, useRef } from 'react'
import {
  Plus,
  Download,
  Search,
  X,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'

import { NovoAgendamentoModal } from '@/features/agenda/components/NovoAgendamentoModal'
import { AgendamentosTabela } from './AgendamentosTabela'
import { AgendamentoEditarModal } from './AgendamentoEditarModal'
import { useAgendamentos } from '../hooks/useAgendamentos'
import { agendamentosService } from '../services/agendamentosService'
import type { AgendamentoComDetalhes, FiltrosAgendamentos } from '../types/agendamentos.types'
import { filtrosDefault, POR_PAGINA } from '../types/agendamentos.types'
import { AGENDAMENTO_STATUS, STATUS_LABELS } from '@/features/agenda/types/agenda.types'
import { parseISO, formatDate, formatTime } from '@/features/agenda/utils/dateUtils'

// ─── Utilitário de exportação CSV ───────────────────────────────────────────

function gerarCSV(dados: AgendamentoComDetalhes[]): void {
  const headers = [
    'Data',
    'Hora',
    'Paciente',
    'CPF',
    'Dentista',
    'Procedimento',
    'Duracao (min)',
    'Status',
    'Observacoes',
  ]

  const rows = dados.map((a) => {
    const dt = parseISO(a.data_hora)
    return [
      formatDate(dt),
      formatTime(dt),
      a.paciente_nome ?? '',
      a.paciente_cpf ?? '',
      a.dentista_nome,
      a.procedimento_nome ?? '',
      String(a.duracao_minutos),
      STATUS_LABELS[a.status],
      (a.observacoes ?? '').replace(/\n/g, ' '),
    ]
  })

  const csvContent = [headers, ...rows]
    .map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `agendamentos_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ─── Componente principal ────────────────────────────────────────────────────

interface AgendamentosPageClientProps {
  clinicaId: string
}

export function AgendamentosPageClient({ clinicaId }: AgendamentosPageClientProps) {
  const {
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
    refetch,
  } = useAgendamentos({ clinicaId })

  // Estado local dos inputs de filtro (para atualização imediata da UI)
  const [filtroLocal, setFiltroLocal] = useState<FiltrosAgendamentos>(filtrosDefault)

  // Modals
  const [novoModalOpen, setNovoModalOpen] = useState(false)
  const [editarAgendamento, setEditarAgendamento] = useState<
    AgendamentoComDetalhes | undefined
  >()

  // Export
  const [isExporting, setIsExporting] = useState(false)

  // Debounce para o campo de busca de paciente
  const pacienteSearchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function handleFiltroChange(key: keyof FiltrosAgendamentos, value: string) {
    const next: FiltrosAgendamentos = { ...filtroLocal, [key]: value }
    setFiltroLocal(next)

    if (key === 'pacienteNome') {
      // Debounce para evitar muitas requisições enquanto o usuário digita
      clearTimeout(pacienteSearchTimeout.current)
      pacienteSearchTimeout.current = setTimeout(() => aplicarFiltros(next), 400)
    } else {
      aplicarFiltros(next)
    }
  }

  function handleLimparFiltros() {
    setFiltroLocal(filtrosDefault)
    limparFiltros()
  }

  async function handleExportar() {
    setIsExporting(true)
    try {
      const dados = await agendamentosService.exportarTodos(clinicaId, filtros)
      if (dados.length === 0) {
        toast.warning('Nenhum dado para exportar com os filtros atuais.')
        return
      }
      gerarCSV(dados)
      toast.success(`${dados.length} agendamento${dados.length !== 1 ? 's' : ''} exportado${dados.length !== 1 ? 's' : ''}.`)
    } catch {
      toast.error('Erro ao exportar dados.')
    } finally {
      setIsExporting(false)
    }
  }

  const temFiltrosAtivos =
    filtros.dataInicio !== '' ||
    filtros.dataFim !== '' ||
    filtros.dentistaId !== '' ||
    filtros.pacienteNome !== '' ||
    filtros.status !== ''

  // Calcula os números de página para exibir (máx. 5 botões)
  function getPaginasVisiveis(): number[] {
    if (totalPaginas <= 5) return Array.from({ length: totalPaginas }, (_, i) => i + 1)
    const start = Math.max(1, Math.min(pagina - 2, totalPaginas - 4))
    return Array.from({ length: 5 }, (_, i) => start + i).filter((p) => p <= totalPaginas)
  }

  return (
    <div className="space-y-5">
      {/* Barra superior: contador + ações */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {isLoading ? (
            'Carregando...'
          ) : total > 0 ? (
            <>
              <span className="font-semibold text-gray-900">{total}</span>{' '}
              agendamento{total !== 1 ? 's' : ''}
              {temFiltrosAtivos && (
                <span className="text-blue-600"> (filtrado{total !== 1 ? 's' : ''})</span>
              )}
            </>
          ) : (
            'Nenhum agendamento encontrado'
          )}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportar}
            disabled={isExporting || isLoading || total === 0}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Exportar CSV
          </button>

          <button
            onClick={() => setNovoModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Painel de filtros */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtros</span>
          {temFiltrosAtivos && (
            <button
              onClick={handleLimparFiltros}
              className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              <X className="h-3 w-3" />
              Limpar filtros
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Busca por paciente */}
          <div className="relative min-w-52 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filtroLocal.pacienteNome}
              onChange={(e) => handleFiltroChange('pacienteNome', e.target.value)}
              placeholder="Buscar paciente..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Dentista */}
          <select
            value={filtroLocal.dentistaId}
            onChange={(e) => handleFiltroChange('dentistaId', e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todos os dentistas</option>
            {dentistas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={filtroLocal.status}
            onChange={(e) => handleFiltroChange('status', e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            {AGENDAMENTO_STATUS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          {/* Período: De */}
          <div>
            <label className="mb-1 block text-xs text-gray-400">De</label>
            <input
              type="date"
              value={filtroLocal.dataInicio}
              onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Período: Até */}
          <div>
            <label className="mb-1 block text-xs text-gray-400">Até</label>
            <input
              type="date"
              value={filtroLocal.dataFim}
              onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tabela / estados de carregamento e erro */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2.5 text-sm text-gray-500">Carregando agendamentos...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button
              onClick={refetch}
              className="mt-3 text-sm text-blue-600 underline hover:text-blue-800"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="p-4">
            <AgendamentosTabela
              agendamentos={agendamentos}
              onEditar={setEditarAgendamento}
              onRefetch={refetch}
            />
          </div>
        )}

        {/* Paginação */}
        {!isLoading && !error && total > POR_PAGINA && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500">
              Página{' '}
              <span className="font-medium text-gray-700">{pagina}</span> de{' '}
              <span className="font-medium text-gray-700">{totalPaginas}</span>
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagina(pagina - 1)}
                disabled={pagina <= 1}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPaginasVisiveis().map((p) => (
                <button
                  key={p}
                  onClick={() => setPagina(p)}
                  className={`min-w-[28px] rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                    p === pagina
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPagina(pagina + 1)}
                disabled={pagina >= totalPaginas}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Novo Agendamento */}
      <NovoAgendamentoModal
        open={novoModalOpen}
        onClose={() => setNovoModalOpen(false)}
        onSuccess={() => {
          setNovoModalOpen(false)
          refetch()
        }}
        clinicaId={clinicaId}
        dentistas={dentistas}
        procedimentos={procedimentos}
      />

      {/* Modal: Editar Agendamento */}
      <AgendamentoEditarModal
        open={editarAgendamento !== undefined}
        agendamento={editarAgendamento}
        onClose={() => setEditarAgendamento(undefined)}
        onSuccess={() => {
          setEditarAgendamento(undefined)
          refetch()
        }}
        clinicaId={clinicaId}
        dentistas={dentistas}
        procedimentos={procedimentos}
      />
    </div>
  )
}
