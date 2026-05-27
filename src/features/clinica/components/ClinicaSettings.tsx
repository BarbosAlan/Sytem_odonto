'use client'

/**
 * ClinicaSettings — container com abas para configuração da clínica
 * Recebe dados iniciais do servidor (server component pai)
 */
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Building2, MapPin, Clock, Palette } from 'lucide-react'

import { ClinicaGeralForm } from './ClinicaGeralForm'
import { ClinicaEnderecoForm } from './ClinicaEnderecoForm'
import { ClinicaHorarioForm } from './ClinicaHorarioForm'
import { ClinicaLogoUpload } from './ClinicaLogoUpload'
import type { ClinicaData } from '../types/clinica.types'

interface ClinicaSettingsProps {
  clinicaId: string
  initialData: ClinicaData
}

export function ClinicaSettings({ clinicaId, initialData }: ClinicaSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações da Clínica</h2>
        <p className="mt-1 text-gray-500">
          Gerencie as informações, endereço e horários de funcionamento
        </p>
      </div>

      {/* Abas */}
      <Tabs defaultValue="geral">
        <div className="overflow-x-auto pb-1">
          <TabsList>
            <TabsTrigger value="geral">
              <Building2 className="mr-1.5 h-4 w-4" />
              Informações Gerais
            </TabsTrigger>
            <TabsTrigger value="endereco">
              <MapPin className="mr-1.5 h-4 w-4" />
              Endereço
            </TabsTrigger>
            <TabsTrigger value="horario">
              <Clock className="mr-1.5 h-4 w-4" />
              Funcionamento
            </TabsTrigger>
            <TabsTrigger value="aparencia">
              <Palette className="mr-1.5 h-4 w-4" />
              Aparência
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="geral">
          <ClinicaGeralForm clinicaId={clinicaId} initialData={initialData} />
        </TabsContent>

        <TabsContent value="endereco">
          <ClinicaEnderecoForm clinicaId={clinicaId} initialData={initialData} />
        </TabsContent>

        <TabsContent value="horario">
          <ClinicaHorarioForm clinicaId={clinicaId} initialData={initialData} />
        </TabsContent>

        <TabsContent value="aparencia">
          <ClinicaLogoUpload clinicaId={clinicaId} currentLogoUrl={initialData.logo_url} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
