'use client'

import { lazy, Suspense } from 'react'
import { AppLayout, useAppLayout } from '@/components/layout/app-layout'
import { Loader2 } from 'lucide-react'

const ApplicationDetailLazy = lazy(() => import('@/components/applications/application-detail').then(m => ({ default: m.ApplicationDetail })))

const DashboardView = lazy(() => import('@/components/dashboard/dashboard-view').then(m => ({ default: m.DashboardView })))
const ApplicationsModule = lazy(() => import('@/components/applications/applications-module').then(m => ({ default: m.ApplicationsModule })))
const LandParcelsView = lazy(() => import('@/components/views/land-parcels-view').then(m => ({ default: m.LandParcelsView })))
const BuildingPermitsView = lazy(() => import('@/components/views/building-permits-view').then(m => ({ default: m.BuildingPermitsView })))
const PaymentsView = lazy(() => import('@/components/views/payments-view').then(m => ({ default: m.PaymentsView })))
const ConstructionView = lazy(() => import('@/components/views/construction-view').then(m => ({ default: m.ConstructionView })))
const DocumentationView = lazy(() => import('@/components/views/documentation-view').then(m => ({ default: m.DocumentationView })))
const GrievancesView = lazy(() => import('@/components/views/grievances-view').then(m => ({ default: m.GrievancesView })))
const CancellationsView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.CancellationsView })))
const ReportsView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.ReportsView })))
const AuditLogView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.AuditLogView })))
const UsersView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.UsersView })))
const DepartmentsView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.DepartmentsView })))
const SettingsView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.SettingsView })))
const GISView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.GISView })))
const RiskAlertsView = lazy(() => import('@/components/views/simple-views').then(m => ({ default: m.RiskAlertsView })))
const DealsView = lazy(() => import('@/components/views/deals-view').then(m => ({ default: m.DealsView })))

function Fallback() {
  return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
}

function ViewRouter() {
  const { view, viewParams } = useAppLayout()

  if (view === 'application-detail' && viewParams.id) {
    return <Suspense fallback={<Fallback />}><ApplicationDetailLazy /></Suspense>
  }

  const viewMap: Record<string, React.ReactNode> = {
    'dashboard': <Suspense fallback={<Fallback />}><DashboardView /></Suspense>,
    'applications': <Suspense fallback={<Fallback />}><ApplicationsModule /></Suspense>,
    'land-parcels': <Suspense fallback={<Fallback />}><LandParcelsView /></Suspense>,
    'building-permits': <Suspense fallback={<Fallback />}><BuildingPermitsView /></Suspense>,
    'payments': <Suspense fallback={<Fallback />}><PaymentsView /></Suspense>,
    'constructions': <Suspense fallback={<Fallback />}><ConstructionView /></Suspense>,
    'documentation': <Suspense fallback={<Fallback />}><DocumentationView /></Suspense>,
    'grievances': <Suspense fallback={<Fallback />}><GrievancesView /></Suspense>,
    'cancellations': <Suspense fallback={<Fallback />}><CancellationsView /></Suspense>,
    'reports': <Suspense fallback={<Fallback />}><ReportsView /></Suspense>,
    'audit-log': <Suspense fallback={<Fallback />}><AuditLogView /></Suspense>,
    'users': <Suspense fallback={<Fallback />}><UsersView /></Suspense>,
    'departments': <Suspense fallback={<Fallback />}><DepartmentsView /></Suspense>,
    'settings': <Suspense fallback={<Fallback />}><SettingsView /></Suspense>,
    'gis': <Suspense fallback={<Fallback />}><GISView /></Suspense>,

    'risk-alerts': <Suspense fallback={<Fallback />}><RiskAlertsView /></Suspense>,
    'deals': <Suspense fallback={<Fallback />}><DealsView /></Suspense>,
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
