/**
 * ProcedimentoFormModal — modal de criação e edição de procedimento
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

import {
  procedimentoSchema,
  type ProcedimentoFormValues,
  precoStrToNumber,
} from '../validations/procedimento.schemas'
import { procedimentoService } from '../services/procedimentoService'
import {
  CATEGORIAS_PROCEDIMENTO,
  DURACOES_PADRAO,
  CORES_PROCEDIMENTO,
  type ProcedimentoData,
} from '../types/procedimento.types'

interface ProcedimentoFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (procedimento: ProcedimentoData) => void
  clinicaId: string
  initialData?: ProcedimentoData
}

export function ProcedimentoFormModal({
  open,
  onClose,
  onSuccess,
  clinicaId,
  initialData,
}: ProcedimentoFormModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const isEditing = !!initialData

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProcedimentoFormValues>({
    resolver: zodResolver(procedimentoSchema),
    defaultValues: {
      nome: '',
      codigo: '',
      descricao: '',
      categoria: 'Outros',
      duracao_minutos: 30,
      preco_str: '',
      cor: '#3B82F6',
      ativo: true,
    },
  })

  const selectedCor = watch('cor')
  const selectedDuracao = watch('duracao_minutos')

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          nome: initialData.nome,
          codigo: initialData.codigo ?? '',
          descricao: initialData.descricao ?? '',
          categoria: initialData.categoria as (typeof CATEGORIAS_PROCEDIMENTO)[number],
          duracao_minutos: initialData.duracao_minutos,
          preco_str: initialData.preco > 0 ? String(initialData.preco.toFixed(2)).replace('.', ',') : '',
          cor: initialData.cor,
          ativo: initialData.ativo,
        })
      } else {
        reset({
          nome: '',
          codigo: '',
          descricao: '',
          categoria: 'Outros',
          duracao_minutos: 30,
          preco_str: '',
          cor: '#3B82F6',
          ativo: true,
        })
      }
    }
  }, [open, initialData, reset])

  const onSubmit = async (values: ProcedimentoFormValues) => {
    try {
      setIsSaving(true)
      const preco = precoStrToNumber(values.preco_str)
      const codigo = values.codigo?.trim() || null
      const descricao = values.descricao?.trim() || null

      let procedimento: ProcedimentoData

      if (isEditing && initialData) {
        procedimento = await procedimentoService.atualizar(initialData.id, {
          nome: values.nome,
          codigo,
          descricao,
          categoria: values.categoria,
          duracao_minutos: values.duracao_minutos,
          preco,
          cor: values.cor,
          ativo: values.ativo,
        })
        toast.success('Procedimento atualizado com sucesso!')
      } else {
        procedimento = await procedimentoService.criar({
          clinica_id: clinicaId,
          nome: values.nome,
          codigo,
          descricao,
          categoria: values.categoria,
          duracao_minutos: values.duracao_minutos,
          preco,
          cor: values.cor,
          ativo: true,
        })
        toast.success('Procedimento cadastrado com sucesso!')
      }

      onSuccess(procedimento)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar procedimento')
    } finally {
      setIsSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar Procedimento' : 'Novo Procedimento'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-5">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="nome">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nome"
              placeholder="Ex.: Consulta inicial, Extração simples…"
              {...register('nome')}
              className={errors.nome ? 'border-red-400' : ''}
            />
            {errors.nome && (
              <p className="text-xs text-red-500">{errors.nome.message}</p>
            )}
          </div>

          {/* Código + Categoria em linha */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                placeholder="Ex.: 81000030"
                {...register('codigo')}
                className={errors.codigo ? 'border-red-400' : ''}
              />
              {errors.codigo && (
                <p className="text-xs text-red-500">{errors.codigo.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="categoria">
                Categoria <span className="text-red-500">*</span>
              </Label>
              <select
                id="categoria"
                {...register('categoria')}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                  errors.categoria ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                {CATEGORIAS_PROCEDIMENTO.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.categoria && (
                <p className="text-xs text-red-500">{errors.categoria.message}</p>
              )}
            </div>
          </div>

          {/* Duração */}
          <div className="space-y-1.5">
            <Label>
              Duração <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {DURACOES_PADRAO.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setValue('duracao_minutos', value, { shouldValidate: true })
                  }
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedDuracao === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Campo manual caso o usuário queira outro valor */}
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="number"
                min={5}
                max={480}
                placeholder="Outro (min)"
                value={
                  DURACOES_PADRAO.some((d) => d.value === selectedDuracao)
                    ? ''
                    : selectedDuracao
                }
                onChange={(e) => {
                  const v = parseInt(e.target.value)
                  if (!isNaN(v)) setValue('duracao_minutos', v, { shouldValidate: true })
                }}
                className="w-32"
              />
              <span className="text-sm text-gray-400">minutos</span>
            </div>
            {errors.duracao_minutos && (
              <p className="text-xs text-red-500">{errors.duracao_minutos.message}</p>
            )}
          </div>

          {/* Preço */}
          <div className="space-y-1.5">
            <Label htmlFor="preco_str">Valor (R$)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                R$
              </span>
              <Input
                id="preco_str"
                placeholder="0,00"
                className={`pl-9 ${errors.preco_str ? 'border-red-400' : ''}`}
                {...register('preco_str')}
              />
            </div>
            {errors.preco_str && (
              <p className="text-xs text-red-500">{errors.preco_str.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <textarea
              id="descricao"
              rows={3}
              placeholder="Descreva o procedimento (opcional)…"
              {...register('descricao')}
              className={`w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                errors.descricao ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.descricao && (
              <p className="text-xs text-red-500">{errors.descricao.message}</p>
            )}
          </div>

          {/* Cor */}
          <div className="space-y-1.5">
            <Label>Cor na agenda</Label>
            <div className="flex flex-wrap gap-2">
              {CORES_PROCEDIMENTO.map(({ value, label }) => (
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
              {isEditing ? 'Salvar alterações' : 'Cadastrar procedimento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
