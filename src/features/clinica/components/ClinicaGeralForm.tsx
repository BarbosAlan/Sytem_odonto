'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'

import { clinicaGeralSchema, type ClinicaGeralFormData } from '../validations/clinica.schemas'
import { clinicaService } from '../services/clinicaService'
import type { ClinicaData } from '../types/clinica.types'

// ─── Helpers de máscara ────────────────────────────────────────────────────

function formatCNPJ(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 14)
  if (clean.length <= 2) return clean
  if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`
  if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`
  if (clean.length <= 12)
    return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`
}

function formatPhone(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 11)
  if (clean.length === 0) return ''
  if (clean.length <= 2) return `(${clean}`
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`
  if (clean.length <= 10)
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface ClinicaGeralFormProps {
  clinicaId: string
  initialData: ClinicaData
}

// ─── Component ─────────────────────────────────────────────────────────────

export function ClinicaGeralForm({ clinicaId, initialData }: ClinicaGeralFormProps) {
  const form = useForm<ClinicaGeralFormData>({
    resolver: zodResolver(clinicaGeralSchema),
    defaultValues: {
      nome: initialData.nome,
      cnpj: initialData.cnpj ?? '',
      telefone: initialData.telefone ?? '',
      email: initialData.email ?? '',
    },
  })

  const {
    formState: { isSubmitting },
  } = form

  async function onSubmit(data: ClinicaGeralFormData) {
    try {
      await clinicaService.updateGeral(clinicaId, {
        nome: data.nome,
        cnpj: data.cnpj || null,
        telefone: data.telefone || null,
        email: data.email || null,
      })
      toast.success('Informações atualizadas com sucesso!')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar informações'
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Gerais</CardTitle>
        <CardDescription>Nome, contato e documentos da clínica</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nome */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Clínica *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Clínica Odonto Barbosa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CNPJ + Telefone */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00.000.000/0000-00"
                        {...field}
                        onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        {...field}
                        onChange={(e) => field.onChange(formatPhone(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* E-mail */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contato@clinica.com.br"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Salvando…' : 'Salvar Informações'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
