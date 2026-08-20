'use client'

import { lazy, Suspense } from 'react'
import { AppLayout, useAppLayout } from '@/components/layout/app-layout'
import { ApplicationDetail } from '@/components/applications/application-detail'
import { Loader2 } from 'lucide-react'

const DashboardView = lazy(() => import('@/components/dashboard/dashboard-view').then(m => ({ default: m.DashboardView })))
const ApplicationsList = lazy(() => import('@/components/applications/applications-list').then(m => ({ default: m.ApplicationsList })))
const WorkflowKanban = lazy(() => import('@/components/views/index-kanban').then(m => ({ default: m.WorkflowKanban })))
const LandParcelsView = lazy(() => import('@/components/views/land-parcels-view').then(m => ({ default: m.LandParcelsView })))
const PaymentsView = lazy(() => import('@/components/views/payments-view').then(m => ({ default: m.PaymentsView })))
const ConstructionView = lazy(() => import('@/components/views/construction-view').then(m => ({ default: m.ConstructionView })))
const GrievancesView = lazy(() => import('@/components/views/grievances-view').then(m => ({ default: m.GrievancesView })))
const CancellationsView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.CancellationsView })))
const ReportsView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.ReportsView })))
const AuditLogView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.AuditLogView })))
const NotificationsView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.NotificationsView })))
const UsersView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.UsersView })))
const DepartmentsView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.DepartmentsView })))
const SettingsView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.SettingsView })))
const GISView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.GISView })))
const MyWorkQueue = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.MyWorkQueue })))
const RiskAlertsView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.RiskAlertsView })))

function Fallback() {
  return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
}

function ViewRouter() {
  const { view, viewParams } = useAppLayout()

  if (view === 'application-detail' && viewParams.id) {
    return <ApplicationDetail />
  }

  const viewMap: Record<string, React.ReactNode> = {
    'dashboard': <Suspense fallback={<Fallback />}><DashboardView /></Suspense>,
    'applications': <Suspense fallback={<Fallback />}><ApplicationsList /></Suspense>,
    'workflow-kanban': <Suspense fallback={<Fallback />}><WorkflowKanban /></Suspense>,
    'land-parcels': <Suspense fallback={<Fallback />}><LandParcelsView /></Suspense>,
    'payments': <Suspense fallback={<Fallback />}><PaymentsView /></Suspense>,
    'constructions': <Suspense fallback={<Fallback />}><ConstructionView /></Suspense>,
    'grievances': <Suspense fallback={<Fallback />}><GrievancesView /></Suspense>,
    'cancellations': <Suspense fallback={<Fallback />}><CancellationsView /></Suspense>,
    'reports': <Suspense fallback={<Fallback />}><ReportsView /></Suspense>,
    'audit-log': <Suspense fallback={<Fallback />}><AuditLogView /></Suspense>,
    'notifications': <Suspense fallback={<Fallback />}><NotificationsView /></Suspense>,
    'users': <Suspense fallback={<Fallback />}><UsersView /></Suspense>,
    'departments': <Suspense fallback={<Fallback />}><DepartmentsView /></Suspense>,
    'settings': <Suspense fallback={<Fallback />}><SettingsView /></Suspense>,
    'gis': <Suspense fallback={<Fallback />}><GISView /></Suspense>,
    'my-work-queue': <Suspense fallback={<Fallback />}><MyWorkQueue /></Suspense>,
    'risk-alerts': <Suspense fallback={<Fallback />}><RiskAlertsView /></Suspense>,
  }

  return viewMap[view] || <Suspense fallback={<Fallback />}><DashboardView /></Suspense>
}

export function AppShell() {
  return (
    <AppLayout>
      <ViewRouter />
    </AppLayout>
  )
}
