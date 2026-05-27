/**
 * LogoutButton — botão reutilizável de logout
 */
'use client'

import { useState } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '../hooks/useAuth'
import { cn } from '@/lib/utils'

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline' | 'destructive'
  showIcon?: boolean
  showLabel?: boolean
  className?: string
}

export function LogoutButton({
  variant = 'ghost',
  showIcon = true,
  showLabel = true,
  className,
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { signOut } = useAuth()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={cn('gap-2', className)}
      aria-label="Sair do sistema"
    >
      {isLoggingOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        showIcon && <LogOut className="h-4 w-4" />
      )}
      {showLabel && <span>Sair</span>}
    </Button>
  )
}
