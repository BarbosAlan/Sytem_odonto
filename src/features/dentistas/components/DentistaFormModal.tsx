/**
 * DentistaFormModal — modal de criação e edição de dentista
 */
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { dentistaSchema, type DentistaFormValues } from '../validations/dentista.schemas'
import { dentistaService } from '../services/dentistaService'
import {
  ESPECIALIDADES_ODONTO,
  CORES_CALENDARIO,
  type DentistaData,
} from '../types/dentista.types'

interface DentistaFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (dentista: DentistaData) => void
  clinicaId: string
  /** Se fornecido, entra em modo de edição */
  initialData?: DentistaData
}

// ─── Formatação de telefone ────────────────────────────────────────────────
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function DentistaFormModal({
  open,
  onClose,
  onSuccess,
  clinicaId,
  initialData,
}: DentistaFormModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DentistaFormValues>({
    resolver: zodResolver(dentistaSchema),
    defaultValues: {
      nome: '',
      cro: '',
      especialidades: [],
      email: '',
      telefone: '',
      cor: '#3B82F6',
      ativo: true,
    },
  })

  const selectedEspecialidades = watch('especialidades') ?? []
  const selectedCor = watch('cor')

  // Preenche o formulário ao abrir em modo de edição
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          nome: initialData.nome,
          cro: initialData.cro,
          especialidades: initialData.especialidades,
          email: initialData.email ?? '',
          telefone: initialData.telefone ?? '',
          cor: initialData.cor,
          ativo: initialData.ativo,
        })
      } else {
        reset({
          nome: '',
          cro: '',
          especialidades: [],
          email: '',
          telefone: '',
          cor: '#3B82F6',
          ativo: true,
        })
      }
    }
  }, [open, initialData, reset])

  const toggleEspecialidade = (esp: string) => {
    const current = watch('especialidades') ?? []
    if (current.includes(esp)) {
      setValue('especialidades', current.filter((e) => e !== esp), {
        shouldValidate: true,
      })
    } else {
      setValue('especialidades', [...current, esp], { shouldValidate: true })
    }
  }

  const onSubmit = async (values: DentistaFormValues) => {
    try {
      setIsSaving(true)
      let dentista: DentistaData

      // Converte strings vazias em null para os campos opcionais
      const email = values.email?.trim() || null
      const telefone = values.telefone?.trim() || null

      if (isEditing && initialData) {
        dentista = await dentistaService.atualizar(initialData.id, {
          nome: values.nome,
          cro: values.cro,
          especialidades: values.especialidades,
          email,
          telefone,
          cor: values.cor,
          ativo: values.ativo,
        })
        toast.success('Dentista atualizado com sucesso!')
      } else {
        dentista = await dentistaService.criar({
          clinica_id: clinicaId,
          nome: values.nome,
          cro: values.cro,
          especialidades: values.especialidades,
          email,
          telefone,
          cor: values.cor,
          ativo: true,
        })
        toast.success('Dentista cadastrado com sucesso!')
      }

      onSuccess(dentista)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar dentista')
    } finally {
      setIsSaving(false)
    }
  }

  if (!open) return null

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar Dentista' : 'Novo Dentista'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="nome">
              Nome completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nome"
              placeholder="Dr. João da Silva"
              {...register('nome')}
              className={errors.nome ? 'border-red-400' : ''}
            />
            {errors.nome && (
              <p className="text-xs text-red-500">{errors.nome.message}</p>
            )}
          </div>

          {/* CRO */}
          <div className="space-y-1.5">
            <Label htmlFor="cro">
              CRO <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cro"
              placeholder="CRO-SP 12345"
              {...register('cro')}
              className={errors.cro ? 'border-red-400' : ''}
            />
            {errors.cro && (
              <p className="text-xs text-red-500">{errors.cro.message}</p>
            )}
          </div>

          {/* Especialidades */}
          <div className="space-y-1.5">
            <Label>
              Especialidades <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {ESPECIALIDADES_ODONTO.map((esp) => {
                const active = selectedEspecialidades.includes(esp)
                return (
                  <button
                    key={esp}
                    type="button"
                    onClick={() => toggleEspecialidade(esp)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {esp}
                  </button>
                )
              })}
            </div>
            {errors.especialidades && (
              <p className="text-xs text-red-500">
                {errors.especialidades.message}
              </p>
            )}
          </div>

          {/* E-mail */}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="doutor@clinica.com.br"
              {...register('email')}
              className={errors.email ? 'border-red-400' : ''}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-1.5">
            <Label htmlFor="telefone">Telefone / WhatsApp</Label>
            <Input
              id="telefone"
              placeholder="(11) 99999-9999"
              {...register('telefone')}
              onChange={(e) =>
                setValue('telefone', formatPhone(e.target.value), {
                  shouldValidate: true,
                })
              }
              className={errors.telefone ? 'border-red-400' : ''}
            />
            {errors.telefone && (
              <p className="text-xs text-red-500">{errors.telefone.message}</p>
            )}
          </div>

          {/* Cor da agenda */}
          <div className="space-y-1.5">
            <Label>Cor na agenda</Label>
            <div className="flex flex-wrap gap-2">
              {CORES_CALENDARIO.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  title={label}
                  onClick={() => setValue('cor', value, { shouldValidate: true })}
                  className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    selectedCor === value
                      ? 'border-gray-900 scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: value }}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar alterações' : 'Cadastrar dentista'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
