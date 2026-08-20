'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { LoginForm } from '@/components/login/login-form'
import { AppLayout, useAppLayout, type View } from '@/components/layout/app-layout'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { ApplicationsList } from '@/components/applications/applications-list'
import { ApplicationDetail } from '@/components/applications/application-detail'
import { WorkflowKanban, LandParcelsView, PaymentsView, ConstructionView, GrievancesView, CancellationsView, ReportsView, AuditLogView, NotificationsView, UsersView, DepartmentsView, SettingsView, GISView, MyWorkQueue, RiskAlertsView } from '@/components/views'
import { Loader2 } from 'lucide-react'

function ViewRouter() {
  const { view, viewParams } = useAppLayout()

  if (view === 'application-detail' && viewParams.id) {
    return <ApplicationDetail />
  }

  const viewMap: Record<string, React.ReactNode> = {
    'dashboard': <DashboardView />,
    'applications': <ApplicationsList />,
    'workflow-kanban': <WorkflowKanban />,
    'land-parcels': <LandParcelsView />,
    'payments': <PaymentsView />,
    'constructions': <ConstructionView />,
    'grievances': <GrievancesView />,
    'cancellations': <CancellationsView />,
    'reports': <ReportsView />,
    'audit-log': <AuditLogView />,
    'notifications': <NotificationsView />,
    'users': <UsersView />,
    'departments': <DepartmentsView />,
    'settings': <SettingsView />,
    'gis': <GISView />,
    'my-work-queue': <MyWorkQueue />,
    'risk-alerts': <RiskAlertsView />,
  }

  return viewMap[view] || <DashboardView />
}

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
    return <LoginForm />
  }

  return (
    <AppLayout>
      <ViewRouter />
    </AppLayout>
  )
}
