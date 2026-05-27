/**
 * Módulo Clínica — barrel export
 */

// Types
export type { ClinicaData, Endereco, Configuracoes } from './types/clinica.types'

// Validations
export {
  clinicaGeralSchema,
  clinicaEnderecoSchema,
  clinicaHorarioSchema,
} from './validations/clinica.schemas'
export type {
  ClinicaGeralFormData,
  ClinicaEnderecoFormData,
  ClinicaHorarioFormData,
} from './validations/clinica.schemas'

// Service
export { clinicaService } from './services/clinicaService'

// Hooks
export { useClinica } from './hooks/useClinica'

// Components
export { ClinicaSettings } from './components/ClinicaSettings'
export { ClinicaGeralForm } from './components/ClinicaGeralForm'
export { ClinicaEnderecoForm } from './components/ClinicaEnderecoForm'
export { ClinicaHorarioForm } from './components/ClinicaHorarioForm'
export { ClinicaLogoUpload } from './components/ClinicaLogoUpload'
