/**
 * PacienteForm — formulário completo de criação/edição de paciente
 * Usado nas páginas /novo e /[id]/editar
 */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2, Save, ArrowLeft, Search } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ROUTES } from '@/config/routes'

import {
  pacienteSchema,
  pacienteDefaultValues,
  type PacienteFormValues,
} from '../validations/paciente.schemas'
import { pacienteService } from '../services/pacienteService'
import {
  SEXO_OPTIONS,
  ESTADO_CIVIL_OPTIONS,
  ESTADOS_BR,
  formatCPF,
  formatPhone,
  formatCEP,
  type PacienteData,
} from '../types/paciente.types'

// ─── ViaCEP ───────────────────────────────────────────────────────────────

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

// ─── Props ────────────────────────────────────────────────────────────────

interface PacienteFormProps {
  clinicaId: string
  initialData?: PacienteData
}

// ─── Component ────────────────────────────────────────────────────────────

export function PacienteForm({ clinicaId, initialData }: PacienteFormProps) {
  const router = useRouter()
  const isEditing = !!initialData
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingCEP, setIsLoadingCEP] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PacienteFormValues>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: initialData
      ? {
          nome: initialData.nome,
          cpf: initialData.cpf ?? '',
          data_nascimento: initialData.data_nascimento ?? '',
          sexo: initialData.sexo ?? '',
          estado_civil: initialData.estado_civil ?? '',
          profissao: initialData.profissao ?? '',
          telefone: initialData.telefone ?? '',
          email: initialData.email ?? '',
          nome_emergencia: initialData.nome_emergencia ?? '',
          telefone_emergencia: initialData.telefone_emergencia ?? '',
          cep: initialData.endereco?.cep ?? '',
          logradouro: initialData.endereco?.logradouro ?? '',
          numero: initialData.endereco?.numero ?? '',
          complemento: initialData.endereco?.complemento ?? '',
          bairro: initialData.endereco?.bairro ?? '',
          cidade: initialData.endereco?.cidade ?? '',
          estado: initialData.endereco?.estado ?? '',
          convenio: initialData.convenio ?? '',
          numero_convenio: initialData.numero_convenio ?? '',
          observacoes: initialData.observacoes ?? '',
          ativo: initialData.ativo,
        }
      : pacienteDefaultValues,
  })

  // ─── Busca de CEP ──────────────────────────────────────────────────────

  const handleBuscarCEP = async () => {
    const cep = watch('cep')
    setIsLoadingCEP(true)
    const result = await fetchViaCEP(cep)
    setIsLoadingCEP(false)
    if (result) {
      setValue('logradouro', result.logradouro, { shouldValidate: true })
      setValue('bairro', result.bairro, { shouldValidate: true })
      setValue('cidade', result.localidade, { shouldValidate: true })
      setValue('estado', result.uf, { shouldValidate: true })
      toast.success('Endereço preenchido automaticamente')
    } else {
      toast.error('CEP não encontrado')
    }
  }

  // ─── Submit ────────────────────────────────────────────────────────────

  const onSubmit = async (values: PacienteFormValues) => {
    try {
      setIsSaving(true)

      const payload = {
        clinica_id: clinicaId,
        nome: values.nome,
        cpf: values.cpf?.trim() || null,
        data_nascimento: values.data_nascimento || null,
        sexo: (values.sexo as 'M' | 'F' | 'O') || null,
        estado_civil: values.estado_civil || null,
        profissao: values.profissao || null,
        telefone: values.telefone || null,
        email: values.email || null,
        nome_emergencia: values.nome_emergencia || null,
        telefone_emergencia: values.telefone_emergencia || null,
        endereco: {
          cep: values.cep || undefined,
          logradouro: values.logradouro || undefined,
          numero: values.numero || undefined,
          complemento: values.complemento || undefined,
          bairro: values.bairro || undefined,
          cidade: values.cidade || undefined,
          estado: values.estado || undefined,
        },
        convenio: values.convenio || null,
        numero_convenio: values.numero_convenio || null,
        observacoes: values.observacoes || null,
        ativo: values.ativo,
      }

      if (isEditing && initialData) {
        await pacienteService.atualizar(initialData.id, payload)
        toast.success('Paciente atualizado com sucesso!')
        router.push(ROUTES.dashboard.pacientes.detail(initialData.id))
      } else {
        const novo = await pacienteService.criar(payload)
        toast.success('Paciente cadastrado com sucesso!')
        router.push(ROUTES.dashboard.pacientes.detail(novo.id))
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar paciente')
    } finally {
      setIsSaving(false)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Paciente' : 'Novo Paciente'}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {isEditing
              ? 'Atualize os dados do paciente'
              : 'Preencha os dados para cadastrar o paciente'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Seção 1: Dados Pessoais ────────────────────────────────── */}
        <Section title="Dados Pessoais">
          {/* Nome */}
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="nome">
              Nome completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nome"
              placeholder="Nome do paciente"
              {...register('nome')}
              className={errors.nome ? 'border-red-400' : ''}
            />
            {errors.nome && <FieldError msg={errors.nome.message} />}
          </div>

          {/* CPF */}
          <div className="space-y-1.5">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              {...register('cpf')}
              onChange={(e) =>
                setValue('cpf', formatCPF(e.target.value), { shouldValidate: true })
              }
              className={errors.cpf ? 'border-red-400' : ''}
            />
            {errors.cpf && <FieldError msg={errors.cpf.message} />}
          </div>

          {/* Data de nascimento */}
          <div className="space-y-1.5">
            <Label htmlFor="data_nascimento">Data de nascimento</Label>
            <Input
              id="data_nascimento"
              type="date"
              {...register('data_nascimento')}
              className={errors.data_nascimento ? 'border-red-400' : ''}
            />
          </div>

          {/* Sexo */}
          <div className="space-y-1.5">
            <Label htmlFor="sexo">Sexo</Label>
            <select
              id="sexo"
              {...register('sexo')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Não informado</option>
              {SEXO_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Estado civil */}
          <div className="space-y-1.5">
            <Label htmlFor="estado_civil">Estado civil</Label>
            <select
              id="estado_civil"
              {...register('estado_civil')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Não informado</option>
              {ESTADO_CIVIL_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Profissão */}
          <div className="space-y-1.5">
            <Label htmlFor="profissao">Profissão</Label>
            <Input
              id="profissao"
              placeholder="Ex.: Engenheiro, Professor…"
              {...register('profissao')}
            />
          </div>
        </Section>

        {/* ── Seção 2: Contato ──────────────────────────────────────── */}
        <Section title="Contato">
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
            />
          </div>

          {/* E-mail */}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="paciente@email.com"
              {...register('email')}
              className={errors.email ? 'border-red-400' : ''}
            />
            {errors.email && <FieldError msg={errors.email.message} />}
          </div>

          {/* Contato de emergência */}
          <div className="space-y-1.5">
            <Label htmlFor="nome_emergencia">Contato de emergência</Label>
            <Input
              id="nome_emergencia"
              placeholder="Nome do contato"
              {...register('nome_emergencia')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telefone_emergencia">Telefone de emergência</Label>
            <Input
              id="telefone_emergencia"
              placeholder="(11) 99999-9999"
              {...register('telefone_emergencia')}
              onChange={(e) =>
                setValue(
                  'telefone_emergencia',
                  formatPhone(e.target.value),
                  { shouldValidate: true }
                )
              }
            />
          </div>
        </Section>

        {/* ── Seção 3: Endereço ─────────────────────────────────────── */}
        <Section title="Endereço">
          {/* CEP + botão buscar */}
          <div className="space-y-1.5">
            <Label htmlFor="cep">CEP</Label>
            <div className="flex gap-2">
              <Input
                id="cep"
                placeholder="00000-000"
                {...register('cep')}
                onChange={(e) =>
                  setValue('cep', formatCEP(e.target.value), {
                    shouldValidate: true,
                  })
                }
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBuscarCEP}
                disabled={isLoadingCEP}
                className="gap-1.5 px-3"
              >
                {isLoadingCEP ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Logradouro */}
          <div className="space-y-1.5">
            <Label htmlFor="logradouro">Logradouro</Label>
            <Input
              id="logradouro"
              placeholder="Rua, Avenida…"
              {...register('logradouro')}
            />
          </div>

          {/* Número + Complemento */}
          <div className="space-y-1.5">
            <Label htmlFor="numero">Número</Label>
            <Input
              id="numero"
              placeholder="Ex.: 123"
              {...register('numero')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              placeholder="Apto, Sala…"
              {...register('complemento')}
            />
          </div>

          {/* Bairro */}
          <div className="space-y-1.5">
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              id="bairro"
              placeholder="Nome do bairro"
              {...register('bairro')}
            />
          </div>

          {/* Cidade + Estado */}
          <div className="space-y-1.5">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              placeholder="Nome da cidade"
              {...register('cidade')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="estado">Estado</Label>
            <select
              id="estado"
              {...register('estado')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Selecione…</option>
              {ESTADOS_BR.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>
        </Section>

        {/* ── Seção 4: Plano de Saúde ───────────────────────────────── */}
        <Section title="Plano de Saúde">
          <div className="space-y-1.5">
            <Label htmlFor="convenio">Convênio</Label>
            <Input
              id="convenio"
              placeholder="Nome do plano"
              {...register('convenio')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="numero_convenio">Número do convênio</Label>
            <Input
              id="numero_convenio"
              placeholder="Número da carteirinha"
              {...register('numero_convenio')}
            />
          </div>
        </Section>

        {/* ── Seção 5: Observações ──────────────────────────────────── */}
        <Section title="Observações">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="observacoes">Observações gerais</Label>
            <Textarea
              id="observacoes"
              rows={4}
              placeholder="Alergias, condições médicas, informações relevantes…"
              {...register('observacoes')}
              className={errors.observacoes ? 'border-red-400' : ''}
            />
            {errors.observacoes && (
              <FieldError msg={errors.observacoes.message} />
            )}
          </div>

          {/* Status ativo */}
          {isEditing && (
            <div className="col-span-2 flex items-center gap-3">
              <input
                id="ativo"
                type="checkbox"
                {...register('ativo')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              <Label htmlFor="ativo" className="cursor-pointer">
                Paciente ativo
              </Label>
            </div>
          )}
        </Section>

        {/* ── Botões ────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? 'Salvar alterações' : 'Cadastrar paciente'}
          </Button>
        </div>
      </form>
    </div>
  )
}

// ─── Subcomponentes ────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-red-500">{msg}</p>
}
