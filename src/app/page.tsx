'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { LoginForm } from '@/components/login/login-form'
import { Loader2, Building2 } from 'lucide-react'

export default function Home() {
  const { isAuthenticated, isLoading, checkSession } = useAuthStore()
  const [AppShell, setAppShell] = useState<React.ComponentType | null>(null)
  const [shellLoading, setShellLoading] = useState(false)

  const loadShell = useCallback(() => {
    if (AppShell || shellLoading) return
    setShellLoading(true)
    import('@/components/app-shell').then(m => {
      setAppShell(() => m.AppShell)
      setShellLoading(false)
    }).catch(() => setShellLoading(false))
  }, [AppShell, shellLoading])

  useEffect(() => { checkSession() }, [checkSession])
  useEffect(() => {
    if (isAuthenticated) loadShell()
  }, [isAuthenticated, loadShell])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  if (!AppShell) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Building2 className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading portal...</span>
        </div>
      </div>
    )
  }

  return <AppShell />
}
