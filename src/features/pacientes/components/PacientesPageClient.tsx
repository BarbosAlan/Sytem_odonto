/**
 * PacientesPageClient — lista interativa de pacientes
 */
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, UserPlus, Loader2, Power, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/config/routes'

import { usePacientes } from '../hooks/usePacientes'
import { pacienteService } from '../services/pacienteService'
import {
  calcularIdade,
  maskCPF,
  type PacienteData,
} from '../types/paciente.types'

const PAGE_SIZE = 20

interface PacientesPageClientProps {
  clinicaId: string
}

export function PacientesPageClient({ clinicaId }: PacientesPageClientProps) {
  const { pacientes, isLoading, error, refetch } = usePacientes(clinicaId)

  const [search, setSearch] = useState('')
  const [filterAtivo, setFilterAtivo] = useState<'todos' | 'ativo' | 'inativo'>('todos')
  const [page, setPage] = useState(1)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // ─── Filtro + paginação ────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return pacientes.filter((p) => {
      const matchSearch =
        term === '' ||
        p.nome.toLowerCase().includes(term) ||
        (p.cpf ?? '').includes(term) ||
        (p.telefone ?? '').includes(term) ||
        (p.email ?? '').toLowerCase().includes(term)
      const matchAtivo =
        filterAtivo === 'todos' ||
        (filterAtivo === 'ativo' && p.ativo) ||
        (filterAtivo === 'inativo' && !p.ativo)
      return matchSearch && matchAtivo
    })
  }, [pacientes, search, filterAtivo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reseta para página 1 ao filtrar
  const handleSearch = (v: string) => {
    setSearch(v)
    setPage(1)
  }
  const handleFilterAtivo = (v: typeof filterAtivo) => {
    setFilterAtivo(v)
    setPage(1)
  }

  // ─── Handlers ─────────────────────────────────────────────────────────

  const handleToggleAtivo = async (p: PacienteData) => {
    try {
      setTogglingId(p.id)
      await pacienteService.alternarAtivo(p.id, !p.ativo)
      toast.success(p.ativo ? 'Paciente inativado' : 'Paciente ativado')
      void refetch()
    } catch {
      toast.error('Erro ao alterar status do paciente')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await pacienteService.excluir(id)
      toast.success('Paciente excluído com sucesso')
      void refetch()
    } catch {
      toast.error('Erro ao excluir paciente')
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            {pacientes.length > 0
              ? `${pacientes.length} paciente${pacientes.length !== 1 ? 's' : ''} cadastrado${pacientes.length !== 1 ? 's' : ''}`
              : 'Gerencie os pacientes da clínica'}
          </p>
        </div>
        <Link
          href={ROUTES.dashboard.pacientes.new}
          className={cn(buttonVariants({ variant: 'default' }), 'gap-2')}
        >
          <Plus className="h-4 w-4" />
          Novo Paciente
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nome, CPF, telefone ou e-mail…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['todos', 'ativo', 'inativo'] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleFilterAtivo(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filterAtivo === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'todos' ? 'Todos' : s === 'ativo' ? 'Ativos' : 'Inativos'}
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
      {!isLoading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <UserPlus className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            {pacientes.length === 0
              ? 'Nenhum paciente cadastrado ainda'
              : 'Nenhum paciente encontrado'}
          </p>
          {pacientes.length === 0 && (
            <Link
              href={ROUTES.dashboard.pacientes.new}
              className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 gap-2')}
            >
              <Plus className="h-4 w-4" />
              Cadastrar primeiro paciente
            </Link>
          )}
        </div>
      )}

      {/* Tabela */}
      {!isLoading && !error && paginated.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">Paciente</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">CPF</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Telefone</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Convênio</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Idade</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((p) => (
                  <PacienteRow
                    key={p.id}
                    paciente={p}
                    isToggling={togglingId === p.id}
                    isDeleting={deletingId === p.id}
                    isConfirmingDelete={confirmDeleteId === p.id}
                    onToggleAtivo={() => handleToggleAtivo(p)}
                    onRequestDelete={() => setConfirmDeleteId(p.id)}
                    onCancelDelete={() => setConfirmDeleteId(null)}
                    onConfirmDelete={() => handleDelete(p.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-gray-100 md:hidden">
            {paginated.map((p) => (
              <PacienteCard
                key={p.id}
                paciente={p}
                isToggling={togglingId === p.id}
                isDeleting={deletingId === p.id}
                isConfirmingDelete={confirmDeleteId === p.id}
                onToggleAtivo={() => handleToggleAtivo(p)}
                onRequestDelete={() => setConfirmDeleteId(p.id)}
                onCancelDelete={() => setConfirmDeleteId(null)}
                onConfirmDelete={() => handleDelete(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Paginação */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Row desktop ──────────────────────────────────────────────────────────

interface RowProps {
  paciente: PacienteData
  isToggling: boolean
  isDeleting: boolean
  isConfirmingDelete: boolean
  onToggleAtivo: () => void
  onRequestDelete: () => void
  onCancelDelete: () => void
  onConfirmDelete: () => void
}

function getInitials(nome: string) {
  return nome.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function PacienteRow({
  paciente: p,
  isToggling,
  isDeleting,
  isConfirmingDelete,
  onToggleAtivo,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: RowProps) {
  const idade = calcularIdade(p.data_nascimento)

  return (
    <tr className={`transition-colors hover:bg-gray-50 ${!p.ativo ? 'opacity-60' : ''}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            {getInitials(p.nome)}
          </div>
          <div>
            <Link
              href={ROUTES.dashboard.pacientes.detail(p.id)}
              className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
            >
              {p.nome}
            </Link>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-600">
        {p.cpf ? maskCPF(p.cpf) : <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3 text-gray-600">
        {p.telefone ?? <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3 text-gray-600">
        {p.convenio ?? <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3 text-gray-600">
        {idade !== null ? `${idade} anos` : <span className="text-gray-300">—</span>}
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
        {isConfirmingDelete ? (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-red-600">Confirmar?</span>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={onCancelDelete}
              disabled={isDeleting}
            >
              Não
            </Button>
            <Button
              size="sm"
              className="h-7 bg-red-600 px-2 text-xs hover:bg-red-700"
              onClick={onConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Sim'}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <Link
              href={ROUTES.dashboard.pacientes.detail(p.id)}
              title="Ver detalhes"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'h-8 w-8 p-0 text-gray-400 hover:text-blue-600'
              )}
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 w-8 p-0 ${
                p.ativo
                  ? 'text-amber-400 hover:text-amber-600'
                  : 'text-green-400 hover:text-green-600'
              }`}
              onClick={onToggleAtivo}
              disabled={isToggling}
              title={p.ativo ? 'Inativar' : 'Ativar'}
            >
              {isToggling ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Power className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
              onClick={onRequestDelete}
              title="Excluir"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </td>
    </tr>
  )
}

// ─── Card mobile ──────────────────────────────────────────────────────────

function PacienteCard({
  paciente: p,
  isToggling,
  isDeleting,
  isConfirmingDelete,
  onToggleAtivo,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: RowProps) {
  const idade = calcularIdade(p.data_nascimento)

  return (
    <div className={`p-4 ${!p.ativo ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {getInitials(p.nome)}
          </div>
          <div>
            <Link
              href={ROUTES.dashboard.pacientes.detail(p.id)}
              className="font-semibold text-gray-900 hover:text-blue-600"
            >
              {p.nome}
            </Link>
            {idade !== null && (
              <p className="text-xs text-gray-400">{idade} anos</p>
            )}
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

      <div className="mt-2 space-y-0.5 text-xs text-gray-500">
        {p.telefone && <p>{p.telefone}</p>}
        {p.cpf && <p>{maskCPF(p.cpf)}</p>}
        {p.convenio && <p>{p.convenio}</p>}
      </div>

      {isConfirmingDelete ? (
        <div className="mt-3 rounded-xl bg-red-50 p-3 text-center">
          <p className="mb-2 text-xs font-medium text-red-700">Confirmar exclusão?</p>
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
              {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Excluir'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <Link
            href={ROUTES.dashboard.pacientes.detail(p.id)}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'flex-1 gap-1.5 text-xs'
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            Ver
          </Link>
          <Button
            size="sm"
            variant="outline"
            className={`gap-1.5 text-xs ${
              p.ativo
                ? 'text-amber-600 hover:bg-amber-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
            onClick={onToggleAtivo}
            disabled={isToggling}
          >
            <Power className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs text-red-500 hover:bg-red-50"
            onClick={onRequestDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
