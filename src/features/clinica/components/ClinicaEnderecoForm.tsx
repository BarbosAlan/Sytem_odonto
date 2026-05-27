'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Search, Loader2, Save } from 'lucide-react'

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

import { clinicaEnderecoSchema, type ClinicaEnderecoFormData } from '../validations/clinica.schemas'
import { clinicaService } from '../services/clinicaService'
import type { ClinicaData } from '../types/clinica.types'

// ─── Constantes ────────────────────────────────────────────────────────────

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

// ─── ViaCEP helper ─────────────────────────────────────────────────────────

interface ViaCEPResponse {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

async function fetchViaCEP(cep: string): Promise<ViaCEPResponse | null> {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return null
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
    if (!res.ok) return null
    const data = (await res.json()) as ViaCEPResponse
    return data.erro ? null : data
  } catch {
    return null
  }
}

// ─── Component ─────────────────────────────────────────────────────────────

interface ClinicaEnderecoFormProps {
  clinicaId: string
  initialData: ClinicaData
}

export function ClinicaEnderecoForm({ clinicaId, initialData }: ClinicaEnderecoFormProps) {
  const [isFetchingCEP, setIsFetchingCEP] = useState(false)
  const endereco = initialData.endereco ?? {}

  const form = useForm<ClinicaEnderecoFormData>({
    resolver: zodResolver(clinicaEnderecoSchema),
    defaultValues: {
      cep: endereco.cep ?? '',
      logradouro: endereco.logradouro ?? '',
      numero: endereco.numero ?? '',
      complemento: endereco.complemento ?? '',
      bairro: endereco.bairro ?? '',
      cidade: endereco.cidade ?? '',
      estado: endereco.estado ?? '',
    },
  })

  const {
    formState: { isSubmitting },
  } = form

  // ── Busca automática por CEP ────────────────────────────────────────────

  async function handleBuscarCEP() {
    const cep = form.getValues('cep') ?? ''
    const clean = cep.replace(/\D/g, '')

    if (clean.length !== 8) {
      toast.error('Digite um CEP com 8 dígitos')
      return
    }

    setIsFetchingCEP(true)
    try {
      const data = await fetchViaCEP(clean)
      if (!data) {
        toast.error('CEP não encontrado')
        return
      }
      form.setValue('logradouro', data.logradouro ?? '', { shouldDirty: true })
      form.setValue('bairro', data.bairro ?? '', { shouldDirty: true })
      form.setValue('cidade', data.localidade ?? '', { shouldDirty: true })
      form.setValue('estado', data.uf ?? '', { shouldDirty: true })
      toast.success('Endereço preenchido automaticamente!')
    } catch {
      toast.error('Erro ao buscar CEP')
    } finally {
      setIsFetchingCEP(false)
    }
  }

  // ── Submissão ───────────────────────────────────────────────────────────

  async function onSubmit(data: ClinicaEnderecoFormData) {
    try {
      await clinicaService.updateEndereco(clinicaId, {
        cep: data.cep || undefined,
        logradouro: data.logradouro || undefined,
        numero: data.numero || undefined,
        complemento: data.complemento || undefined,
        bairro: data.bairro || undefined,
        cidade: data.cidade || undefined,
        estado: data.estado || undefined,
      })
      toast.success('Endereço atualizado com sucesso!')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao salvar endereço'
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Endereço</CardTitle>
        <CardDescription>Localização física da clínica</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* CEP com botão de busca */}
            <div className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem className="max-w-[180px]">
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00000-000"
                        {...field}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 8)
                          field.onChange(v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleBuscarCEP}
                disabled={isFetchingCEP}
                title="Buscar endereço pelo CEP"
              >
                {isFetchingCEP ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Logradouro + Número */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <FormField
                control={form.control}
                name="logradouro"
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <FormLabel>Logradouro</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, Avenida, Alameda…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Complemento + Bairro */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="complemento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input placeholder="Sala, Andar, Bloco…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Bairro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cidade + Estado */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <select
                        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        {...field}
                      >
                        <option value="">—</option>
                        {ESTADOS_BR.map((uf) => (
                          <option key={uf} value={uf}>
                            {uf}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Salvando…' : 'Salvar Endereço'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
