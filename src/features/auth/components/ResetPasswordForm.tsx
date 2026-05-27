/**
 * ResetPasswordForm — formulário de recuperação de senha
 */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { resetPasswordSchema, type ResetPasswordFormData } from '../validations/auth.schemas'
import { useAuth } from '../hooks/useAuth'
import { ROUTES } from '@/config/routes'

export function ResetPasswordForm() {
  const [emailSent, setEmailSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { resetPassword } = useAuth()

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setFormError(null)
    try {
      await resetPassword(data.email)
      setEmailSent(true)
    } catch {
      setFormError(
        'Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.'
      )
    }
  }

  // Estado de sucesso
  if (emailSent) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-10 pb-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
              <MailCheck className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">E-mail enviado!</h2>
              <p className="text-gray-500 text-sm mt-2 max-w-xs">
                Enviamos as instruções para{' '}
                <span className="font-medium text-gray-700">
                  {form.getValues('email')}
                </span>
                . Verifique sua caixa de entrada e spam.
              </p>
            </div>
            <Link href={ROUTES.auth.login} className="w-full mt-2">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900">Recuperar senha</CardTitle>
        <CardDescription className="text-gray-500">
          Informe seu e-mail e enviaremos as instruções para redefinir a senha.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="seu@email.com"
                      autoComplete="email"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formError && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
              >
                {formError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar instruções'
              )}
            </Button>

            <Link href={ROUTES.auth.login} className="block">
              <Button variant="ghost" className="w-full text-gray-500">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao login
              </Button>
            </Link>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
