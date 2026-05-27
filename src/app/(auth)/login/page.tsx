import type { Metadata } from 'next'
import { Stethoscope } from 'lucide-react'
import { LoginForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'Login | OdontoSystem',
  description: 'Acesse o Sistema de Gestão Odontológica',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-600 shadow-lg mb-4">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">OdontoSystem</h1>
          <p className="mt-2 text-gray-500">Sistema de Gestão Odontológica</p>
        </div>

        <LoginForm />

        <p className="text-center text-xs text-gray-400">
          Acesso restrito a usuários autorizados.
          <br />
          Em caso de problemas, contate o administrador.
        </p>
      </div>
    </div>
  )
}
