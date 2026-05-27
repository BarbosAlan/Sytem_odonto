import type { Metadata } from 'next'
import { Stethoscope } from 'lucide-react'
import { ResetPasswordForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'Recuperar Senha | OdontoSystem',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-600 shadow-lg mb-4">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">OdontoSystem</h1>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  )
}
