/**
 * ProcedimentosPageClient — tabela interativa de procedimentos com CRUD
 */
'use client'

import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  FileText,
  Loader2,
  Clock,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

import { useProcedimentos } from '../hooks/useProcedimentos'
import { ProcedimentoFormModal } from './ProcedimentoFormModal'
import { procedimentoService } from '../services/procedimentoService'
import {
  CATEGORIAS_PROCEDIMENTO,
  formatPreco,
  formatDuracao,
  type ProcedimentoData,
} from '../types/procedimento.types'

interface ProcedimentosPageClientProps {
  clinicaId: string
}

export function ProcedimentosPageClient({ clinicaId }: ProcedimentosPageClientProps) {
  const { procedimentos, isLoading, error, refetch } = useProcedimentos(clinicaId)

  // ─── Estado dos modais ─────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProc, setEditingProc] = useState<ProcedimentoData | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // ─── Filtros ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [filterCategoria, setFilterCategoria] = useState<string>('Todas')
  const [filterAtivo, setFilterAtivo] = useState<'todos' | 'ativo' | 'inativo'>('todos')

  const procedimentosFiltrados = useMemo(() => {
    return procedimentos.filter((p) => {
      const matchSearch =
        search === '' ||
        p.nome.toLowerCase().includes(search.toLowerCase()) ||
        (p.codigo ?? '').toLowerCase().includes(search.toLowerCase()) ||
        p.categoria.toLowerCase().includes(search.toLowerCase())
      const matchCategoria =
        filterCategoria === 'Todas' || p.categoria === filterCategoria
      const matchAtivo =
        filterAtivo === 'todos' ||
        (filterAtivo === 'ativo' && p.ativo) ||
        (filterAtivo === 'inativo' && !p.ativo)
      return matchSearch && matchCategoria && matchAtivo
    })
  }, [procedimentos, search, filterCategoria, filterAtivo])

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleOpenCreate = () => {
    setEditingProc(undefined)
    setModalOpen(true)
  }

  const handleOpenEdit = (p: ProcedimentoData) => {
    setEditingProc(p)
    setModalOpen(true)
  }

  const handleToggleAtivo = async (p: ProcedimentoData) => {
    try {
      setTogglingId(p.id)
      await procedimentoService.alternarAtivo(p.id, !p.ativo)
      toast.success(p.ativo ? 'Procedimento inativado' : 'Procedimento ativado')
      void refetch()
    } catch {
      toast.error('Erro ao alterar status do procedimento')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await procedimentoService.excluir(id)
      toast.success('Procedimento excluído com sucesso')
      void refetch()
    } catch {
      toast.error('Erro ao excluir procedimento')
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  // ─── Estatísticas rápidas ─────────────────────────────────────────────────
  const totalAtivos = procedimentos.filter((p) => p.ativo).length
  const categoriasMapa = useMemo(() => {
    const m: Record<string, number> = {}
    procedimentos.forEach((p) => {
      m[p.categoria] = (m[p.categoria] ?? 0) + 1
    })
    return m
  }, [procedimentos])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procedimentos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Catálogo de procedimentos da clínica
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Procedimento
        </Button>
      </div>

      {/* Cards de resumo */}
      {!isLoading && procedimentos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryCard label="Total" value={procedimentos.length} color="blue" />
          <SummaryCard label="Ativos" value={totalAtivos} color="green" />
          <SummaryCard
            label="Inativos"
            value={procedimentos.length - totalAtivos}
            color="gray"
          />
          <SummaryCard
            label="Categorias"
            value={Object.keys(categoriasMapa).length}
            color="purple"
          />
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou código…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filtro por categoria */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCategoria('Todas')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filterCategoria === 'Todas'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {CATEGORIAS_PROCEDIMENTO.filter((c) => categoriasMapa[c]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategoria(cat)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filterCategoria === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
              <span className="ml-1 text-xs opacity-70">({categoriasMapa[cat]})</span>
            </button>
          ))}
        </div>

        {/* Filtro ativo/inativo */}
        <div className="flex gap-2">
          {(['todos', 'ativo', 'inativo'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterAtivo(status)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filterAtivo === status
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'todos' ? 'Todos' : status === 'ativo' ? 'Ativos' : 'Inativos'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Lista vazia */}
      {!isLoading && !error && procedimentosFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <FileText className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            {procedimentos.length === 0
              ? 'Nenhum procedimento cadastrado ainda'
              : 'Nenhum procedimento encontrado com os filtros aplicados'}
          </p>
          {procedimentos.length === 0 && (
            <Button variant="outline" className="mt-4 gap-2" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              Cadastrar primeiro procedimento
            </Button>
          )}
        </div>
      )}

      {/* Tabela */}
      {!isLoading && !error && procedimentosFiltrados.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">Procedimento</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Categoria</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Duração</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Valor</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {procedimentosFiltrados.map((p) => (
                  <tr
                    key={p.id}
                    className={`transition-colors hover:bg-gray-50 ${!p.ativo ? 'opacity-60' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-2 w-2 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: p.cor }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{p.nome}</p>
                          {p.codigo && (
                            <p className="text-xs text-gray-400">{p.codigo}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        <Tag className="h-3 w-3" />
                        {p.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {formatDuracao(p.duracao_minutos)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {p.preco > 0 ? formatPreco(p.preco) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={p.ativo ? 'default' : 'secondary'}
                        className={`text-xs ${
                          p.ativo
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {confirmDeleteId === p.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-red-600">Confirmar?</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={deletingId === p.id}
                          >
                            Não
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 bg-red-600 px-2 text-xs hover:bg-red-700"
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                          >
                            {deletingId === p.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Sim'
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-700"
                            onClick={() => handleOpenEdit(p)}
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-8 w-8 p-0 ${
                              p.ativo
                                ? 'text-amber-400 hover:text-amber-600'
                                : 'text-green-400 hover:text-green-600'
                            }`}
                            onClick={() => handleToggleAtivo(p)}
                            disabled={togglingId === p.id}
                            title={p.ativo ? 'Inativar' : 'Ativar'}
                          >
                            {togglingId === p.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Power className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                            onClick={() => setConfirmDeleteId(p.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-gray-100 md:hidden">
            {procedimentosFiltrados.map((p) => (
              <div
                key={p.id}
                className={`p-4 ${!p.ativo ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: p.cor }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{p.nome}</p>
                      {p.codigo && <p className="text-xs text-gray-400">{p.codigo}</p>}
                    </div>
                  </div>
                  <Badge
                    variant={p.ativo ? 'default' : 'secondary'}
                    className={`flex-shrink-0 text-xs ${
                      p.ativo
                        ? 'bg-green-100 text-green-700 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {p.categoria}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuracao(p.duracao_minutos)}
                  </span>
                  {p.preco > 0 && (
                    <span className="font-medium text-gray-700">{formatPreco(p.preco)}</span>
                  )}
                </div>

                {confirmDeleteId === p.id ? (
                  <div className="mt-3 rounded-xl bg-red-50 p-3 text-center">
                    <p className="mb-2 text-xs font-medium text-red-700">Confirmar exclusão?</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={deletingId === p.id}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-red-600 text-xs hover:bg-red-700"
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                      >
                        {deletingId === p.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Excluir'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 text-xs"
                      onClick={() => handleOpenEdit(p)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`gap-1.5 text-xs ${
                        p.ativo
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      onClick={() => handleToggleAtivo(p)}
                      disabled={togglingId === p.id}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-red-500 hover:bg-red-50"
                      onClick={() => setConfirmDeleteId(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <ProcedimentoFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => refetch()}
        clinicaId={clinicaId}
        initialData={editingProc}
      />
    </div>
  )
}

// ─── Subcomponente: card de resumo ─────────────────────────────────────────

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'blue' | 'green' | 'gray' | 'purple'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    gray: 'bg-gray-50 text-gray-500',
    purple: 'bg-purple-50 text-purple-700',
  }
  return (
    <div className={`rounded-2xl p-4 ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs font-medium opacity-80">{label}</p>
    </div>
  )
}
