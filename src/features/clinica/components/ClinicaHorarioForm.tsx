'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'

import { clinicaHorarioSchema, type ClinicaHorarioFormData } from '../validations/clinica.schemas'
import { clinicaService } from '../services/clinicaService'
import type { ClinicaData } from '../types/clinica.types'

// ─── Constantes ────────────────────────────────────────────────────────────

const DIAS_SEMANA = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
]

const DURACOES_MINUTOS = [10, 15, 20, 30, 45, 60, 90, 120]

// ─── Estilos reutilizáveis ─────────────────────────────────────────────────

const timeInputCls =
  'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none ' +
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ' +
  'disabled:pointer-events-none disabled:opacity-50'

const selectCls =
  'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors outline-none ' +
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

// ─── Component ─────────────────────────────────────────────────────────────

interface ClinicaHorarioFormProps {
  clinicaId: string
  initialData: ClinicaData
}

export function ClinicaHorarioForm({ clinicaId, initialData }: ClinicaHorarioFormProps) {
  const config = initialData.configuracoes ?? {}

  const form = useForm<ClinicaHorarioFormData>({
    resolver: zodResolver(clinicaHorarioSchema),
    defaultValues: {
      horario_abertura: config.horario_abertura ?? '08:00',
      horario_fechamento: config.horario_fechamento ?? '18:00',
      dias_funcionamento: config.dias_funcionamento ?? [1, 2, 3, 4, 5],
      duracao_padrao_consulta: config.duracao_padrao_consulta ?? 30,
      intervalo_almoco_inicio: config.intervalo_almoco_inicio ?? '',
      intervalo_almoco_fim: config.intervalo_almoco_fim ?? '',
      permite_agendamento_online: config.permite_agendamento_online ?? false,
    },
  })

  const {
    formState: { isSubmitting },
  } = form

  async function onSubmit(data: ClinicaHorarioFormData) {
    try {
      await clinicaService.updateConfiguracoes(clinicaId, data)
      toast.success('Configurações de funcionamento salvas!')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar configurações'
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horário de Funcionamento</CardTitle>
        <CardDescription>
          Define quando a clínica atende e os padrões de agendamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dias de funcionamento */}
            <FormField
              control={form.control}
              name="dias_funcionamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias de Funcionamento</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {DIAS_SEMANA.map((dia) => {
                        const isSelected = (field.value ?? []).includes(dia.value)
                        return (
                          <button
                            key={dia.value}
                            type="button"
                            onClick={() => {
                              const current = field.value ?? []
                              const updated = isSelected
                                ? current.filter((d) => d !== dia.value)
                                : [...current, dia.value].sort((a, b) => a - b)
                              field.onChange(updated)
                            }}
                            className={cn(
                              'flex h-10 w-12 items-center justify-center rounded-md border text-sm font-medium transition-colors select-none',
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                            )}
                          >
                            {dia.label}
                          </button>
                        )
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Horário de abertura e fechamento */}
            <div className="grid grid-cols-2 gap-4 sm:max-w-xs">
              <FormField
                control={form.control}
                name="horario_abertura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Abertura</FormLabel>
                    <FormControl>
                      <input type="time" className={timeInputCls} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="horario_fechamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fechamento</FormLabel>
                    <FormControl>
                      <input type="time" className={timeInputCls} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Intervalo de almoço */}
            <div className="grid grid-cols-2 gap-4 sm:max-w-xs">
              <FormField
                control={form.control}
                name="intervalo_almoco_inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Almoço — início</FormLabel>
                    <FormControl>
                      <input
                        type="time"
                        className={timeInputCls}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="intervalo_almoco_fim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Almoço — fim</FormLabel>
                    <FormControl>
                      <input
                        type="time"
                        className={timeInputCls}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>Opcional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duração padrão da consulta */}
            <FormField
              control={form.control}
              name="duracao_padrao_consulta"
              render={({ field }) => (
                <FormItem className="max-w-[220px]">
                  <FormLabel>Duração Padrão da Consulta</FormLabel>
                  <FormControl>
                    <select
                      className={selectCls}
                      value={field.value ?? 30}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      {DURACOES_MINUTOS.map((d) => (
                        <option key={d} value={d}>
                          {d} minutos
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Agendamento online */}
            <FormField
              control={form.control}
              name="permite_agendamento_online"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0 rounded-lg border border-gray-200 p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      id="agendamento-online"
                      className="h-4 w-4 rounded border-gray-300 accent-blue-600 cursor-pointer"
                      checked={field.value ?? false}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </FormControl>
                  <div className="space-y-0.5">
                    <FormLabel htmlFor="agendamento-online" className="cursor-pointer font-medium">
                      Permitir agendamento online
                    </FormLabel>
                    <FormDescription>
                      Pacientes poderão solicitar consultas pelo portal
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Salvando…' : 'Salvar Funcionamento'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
