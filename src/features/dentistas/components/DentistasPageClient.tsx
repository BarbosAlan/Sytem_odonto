/**
 * DentistasPageClient — lista interativa de dentistas com CRUD
 * Client Component: gerencia busca, modais, toggle ativo, exclusão
 */
'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, Power, Stethoscope, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

import { useDentistas } from '../hooks/useDentistas'
import { DentistaFormModal } from './DentistaFormModal'
import { dentistaService } from '../services/dentistaService'
import type { DentistaData } from '../types/dentista.types'

interface DentistasPageClientProps {
  clinicaId: string
}

export function DentistasPageClient({ clinicaId }: DentistasPageClientProps) {
  const { dentistas, isLoading, error, refetch } = useDentistas(clinicaId)

  // ─── Estado dos modais ─────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDentista, setEditingDentista] = useState<DentistaData | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // ─── Filtros ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [filterAtivo, setFilterAtivo] = useState<'todos' | 'ativo' | 'inativo'>('todos')

  const dentistasFiltered = useMemo(() => {
    return dentistas.filter((d) => {
      const matchSearch =
        search === '' ||
        d.nome.toLowerCase().includes(search.toLowerCase()) ||
        d.cro.toLowerCase().includes(search.toLowerCase()) ||
        d.especialidades.some((e) =>
          e.toLowerCase().includes(search.toLowerCase())
        )
      const matchAtivo =
        filterAtivo === 'todos' ||
        (filterAtivo === 'ativo' && d.ativo) ||
        (filterAtivo === 'inativo' && !d.ativo)
      return matchSearch && matchAtivo
    })
  }, [dentistas, search, filterAtivo])

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleOpenCreate = () => {
    setEditingDentista(undefined)
    setModalOpen(true)
  }

  const handleOpenEdit = (dentista: DentistaData) => {
    setEditingDentista(dentista)
    setModalOpen(true)
  }

  const handleModalSuccess = () => {
    void refetch()
  }

  const handleToggleAtivo = async (dentista: DentistaData) => {
    try {
      setTogglingId(dentista.id)
      await dentistaService.alternarAtivo(dentista.id, !dentista.ativo)
      toast.success(dentista.ativo ? 'Dentista inativado' : 'Dentista ativado')
      void refetch()
    } catch {
      toast.error('Erro ao alterar status do dentista')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await dentistaService.excluir(id)
      toast.success('Dentista excluído com sucesso')
      void refetch()
    } catch {
      toast.error('Erro ao excluir dentista')
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  // ─── Renderização ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dentistas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os dentistas cadastrados na clínica
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Dentista
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nome, CRO ou especialidade…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['todos', 'ativo', 'inativo'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterAtivo(status)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filterAtivo === status
                  ? 'bg-blue-600 text-white'
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
      {!isLoading && !error && dentistasFiltered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <Stethoscope className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            {dentistas.length === 0
              ? 'Nenhum dentista cadastrado ainda'
              : 'Nenhum dentista encontrado com os filtros aplicados'}
          </p>
          {dentistas.length === 0 && (
            <Button variant="outline" className="mt-4 gap-2" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
              Cadastrar primeiro dentista
            </Button>
          )}
        </div>
      )}

      {/* Cards de dentistas */}
      {!isLoading && !error && dentistasFiltered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dentistasFiltered.map((dentista) => (
            <DentistaCard
              key={dentista.id}
              dentista={dentista}
              isToggling={togglingId === dentista.id}
              isDeleting={deletingId === dentista.id}
              isConfirmingDelete={confirmDeleteId === dentista.id}
              onEdit={() => handleOpenEdit(dentista)}
              onToggleAtivo={() => handleToggleAtivo(dentista)}
              onRequestDelete={() => setConfirmDeleteId(dentista.id)}
              onCancelDelete={() => setConfirmDeleteId(null)}
              onConfirmDelete={() => handleDelete(dentista.id)}
            />
          ))}
        </div>
      )}

      {/* Modal de criação/edição */}
      <DentistaFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        clinicaId={clinicaId}
        initialData={editingDentista}
      />
    </div>
  )
}

// ─── Subcomponente: Card de dentista ───────────────────────────────────────

interface DentistaCardProps {
  dentista: DentistaData
  isToggling: boolean
  isDeleting: boolean
  isConfirmingDelete: boolean
  onEdit: () => void
  onToggleAtivo: () => void
  onRequestDelete: () => void
  onCancelDelete: () => void
  onConfirmDelete: () => void
}

function DentistaCard({
  dentista,
  isToggling,
  isDeleting,
  isConfirmingDelete,
  onEdit,
  onToggleAtivo,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: DentistaCardProps) {
  const maxEspecialidades = 3
  const visibleEsp = dentista.especialidades.slice(0, maxEspecialidades)
  const extraCount = dentista.especialidades.length - maxEspecialidades

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-opacity ${
        dentista.ativo ? 'border-gray-200' : 'border-gray-200 opacity-60'
      }`}
    >
      {/* Faixa colorida no topo */}
      <div
        className="h-1.5 w-full rounded-t-2xl"
        style={{ backgroundColor: dentista.cor }}
      />

      <div className="p-5">
        {/* Nome + status */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            {/* Avatar com inicial */}
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: dentista.cor }}
            >
              {dentista.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900 leading-tight">
                {dentista.nome}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{dentista.cro}</p>
            </div>
          </div>
          <Badge
            variant={dentista.ativo ? 'default' : 'secondary'}
            className={`flex-shrink-0 text-xs ${
              dentista.ativo
                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {dentista.ativo ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        {/* Especialidades */}
        {dentista.especialidades.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {visibleEsp.map((esp) => (
              <span
                key={esp}
                className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
              >
                {esp}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                +{extraCount}
              </span>
            )}
          </div>
        )}

        {/* Contato */}
        {(dentista.email || dentista.telefone) && (
          <div className="mb-4 space-y-1 text-xs text-gray-500">
            {dentista.email && <p className="truncate">{dentista.email}</p>}
            {dentista.telefone && <p>{dentista.telefone}</p>}
          </div>
        )}

        {/* Confirmação de exclusão */}
        {isConfirmingDelete ? (
          <div className="rounded-xl bg-red-50 p-3 text-center">
            <p className="mb-2 text-xs font-medium text-red-700">
              Confirmar exclusão? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={onCancelDelete}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-red-600 text-xs hover:bg-red-700"
                onClick={onConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Excluir'
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Ações */
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 text-xs"
              onClick={onEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className={`gap-1.5 text-xs ${
                dentista.ativo
                  ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                  : 'text-green-600 hover:bg-green-50 hover:text-green-700'
              }`}
              onClick={onToggleAtivo}
              disabled={isToggling}
              title={dentista.ativo ? 'Inativar dentista' : 'Ativar dentista'}
            >
              {isToggling ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Power className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={onRequestDelete}
              title="Excluir dentista"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
