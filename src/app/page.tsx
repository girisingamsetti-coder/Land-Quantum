'use client'

import { useEffect, lazy, Suspense } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Loader2 } from 'lucide-react'

const LoginForm = lazy(() => import('@/components/login/login-form').then(m => ({ default: m.LoginForm })))
const AppShell = lazy(() => import('@/components/app-shell').then(m => ({ default: m.AppShell })))

export default function Home() {
  const { isAuthenticated, isLoading, checkSession } = useAuthStore()

  useEffect(() => { checkSession() }, [checkSession])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
        <LoginForm />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <AppShell />
    </Suspense>
  )
}