'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { LoginForm } from '@/components/login/login-form'
import { Loader2, Atom } from 'lucide-react'

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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/20">
          <Atom className="h-6 w-6 text-white" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading Land Quantum...</span>
        </div>
      </div>
    )
  }

  return <AppShell />
}
