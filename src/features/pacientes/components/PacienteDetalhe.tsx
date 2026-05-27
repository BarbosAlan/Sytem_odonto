/**
 * PacienteDetalhe — exibe os dados completos de um paciente (read-only)
 * Com links para editar e navegação de volta
 */
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Pencil,
  Phone,
  Mail,
  MapPin,
  Heart,
  User,
  AlertTriangle,
} from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/config/routes'

import {
  calcularIdade,
  SEXO_OPTIONS,
  ESTADO_CIVIL_OPTIONS,
  type PacienteData,
} from '../types/paciente.types'

interface PacienteDetalheProps {
  paciente: PacienteData
}

export function PacienteDetalhe({ paciente: p }: PacienteDetalheProps) {
  const router = useRouter()
  const idade = calcularIdade(p.data_nascimento)

  const sexoLabel = SEXO_OPTIONS.find((s) => s.value === p.sexo)?.label ?? '—'
  const estadoCivilLabel =
    ESTADO_CIVIL_OPTIONS.find((s) => s.value === p.estado_civil)?.label ?? '—'

  const enderecoCompleto = [
    p.endereco?.logradouro,
    p.endereco?.numero,
    p.endereco?.complemento,
    p.endereco?.bairro,
    p.endereco?.cidade,
    p.endereco?.estado,
  ]
    .filter(Boolean)
    .join(', ')

  function getInitials(nome: string) {
    return nome.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  }

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
      </div>

      {/* Card principal */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-start gap-4 p-6">
          {/* Avatar */}
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold text-blue-700">
            {getInitials(p.nome)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{p.nome}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  {idade !== null && <span>{idade} anos</span>}
                  {p.data_nascimento && (
                    <span>
                      • Nascido em{' '}
                      {new Date(p.data_nascimento + 'T00:00:00').toLocaleDateString(
                        'pt-BR'
                      )}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
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
                <Link
                  href={ROUTES.dashboard.pacientes.edit(p.id)}
                  className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'gap-1.5')}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dados pessoais */}
      <InfoCard title="Dados Pessoais" icon={<User className="h-4 w-4" />}>
        <InfoRow label="CPF" value={p.cpf} />
        <InfoRow label="Sexo" value={p.sexo ? sexoLabel : null} />
        <InfoRow label="Estado civil" value={p.estado_civil ? estadoCivilLabel : null} />
        <InfoRow label="Profissão" value={p.profissao} />
      </InfoCard>

      {/* Contato */}
      <InfoCard title="Contato" icon={<Phone className="h-4 w-4" />}>
        <InfoRow
          label="Telefone"
          value={p.telefone}
          href={p.telefone ? `tel:${p.telefone}` : undefined}
        />
        <InfoRow
          label="E-mail"
          value={p.email}
          href={p.email ? `mailto:${p.email}` : undefined}
        />
        {(p.nome_emergencia || p.telefone_emergencia) && (
          <>
            <InfoRow label="Emergência (nome)" value={p.nome_emergencia} />
            <InfoRow
              label="Emergência (tel.)"
              value={p.telefone_emergencia}
              href={
                p.telefone_emergencia
                  ? `tel:${p.telefone_emergencia}`
                  : undefined
              }
            />
          </>
        )}
      </InfoCard>

      {/* Endereço */}
      {enderecoCompleto && (
        <InfoCard title="Endereço" icon={<MapPin className="h-4 w-4" />}>
          <div className="col-span-2">
            <p className="text-sm text-gray-700">{enderecoCompleto}</p>
            {p.endereco?.cep && (
              <p className="mt-1 text-xs text-gray-400">CEP: {p.endereco.cep}</p>
            )}
          </div>
        </InfoCard>
      )}

      {/* Plano de saúde */}
      {(p.convenio || p.numero_convenio) && (
        <InfoCard title="Plano de Saúde" icon={<Heart className="h-4 w-4" />}>
          <InfoRow label="Convênio" value={p.convenio} />
          <InfoRow label="Número" value={p.numero_convenio} />
        </InfoCard>
      )}

      {/* Observações */}
      {p.observacoes && (
        <InfoCard title="Observações" icon={<AlertTriangle className="h-4 w-4" />}>
          <div className="col-span-2">
            <p className="whitespace-pre-wrap text-sm text-gray-700">{p.observacoes}</p>
          </div>
        </InfoCard>
      )}

      {/* Rodapé com metadados */}
      <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-400">
        <span>
          Cadastrado em{' '}
          {new Date(p.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </span>
        <span>
          Atualizado em{' '}
          {new Date(p.updated_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </span>
      </div>

      {/* Seções futuras */}
      <div className="grid grid-cols-2 gap-4">
        <FutureSection title="Agendamentos" description="Disponível no Módulo 7" />
        <FutureSection title="Prontuários" description="Disponível no Módulo 8" />
      </div>
    </div>
  )
}

// ─── Subcomponentes ────────────────────────────────────────────────────────

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
        <span className="text-gray-400">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6">{children}</div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  href,
}: {
  label: string
  value: string | null | undefined
  href?: string
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      {value ? (
        href ? (
          <a
            href={href}
            className="mt-0.5 text-sm text-blue-600 hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="mt-0.5 text-sm text-gray-900">{value}</p>
        )
      ) : (
        <p className="mt-0.5 text-sm text-gray-400">—</p>
      )}
    </div>
  )
}

function FutureSection({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-8 text-center">
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="mt-1 text-xs text-gray-300">{description}</p>
    </div>
  )
}

