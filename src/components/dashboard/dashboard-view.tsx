'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppLayout, type View } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText,
  LandPlot,
  IndianRupee,
  HardHat,
  MessageSquareWarning,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
} from 'lucide-react'

interface DashboardStats {
  applications: { total: number; pending: number; approved: number; rejected: number }
  landParcels: { total: number; available: number }
  payments: { totalRevenue: number; overdueCount: number }
  constructions: { active: number }
  grievances: { open: number }
}

interface RecentApplication {
  id: string
  applicationNumber: string
  projectName: string | null
  status: string
  createdAt: string
  applicant: { organizationName: string } | null
  landParcel: { plotId: string } | null
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ status }: { status: string }) {
  const variant = (() => {
    switch (status) {
      case 'Approved': case 'Completed': return 'default' as const
      case 'Submitted': case 'Under Review': case 'In Progress': return 'secondary' as const
      case 'Rejected': return 'destructive' as const
      case 'Draft': case 'Pending': return 'outline' as const
      default: return 'secondary' as const
    }
  })()
  return <Badge variant={variant}>{status}</Badge>
}

function StatCard({ title, value, description, icon: Icon, trend }: {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-600" />}
            {trend === 'down' && <ArrowUpRight className="h-3 w-3 text-destructive rotate-90" />}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function PlaceholderView({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
    </div>
  )
}

export function DashboardView() {
  const { view } = useAppLayout()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentApps, setRecentApps] = useState<RecentApplication[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      if (data.success) {
        setStats(data.data.stats)
        setRecentApps(data.data.recentApplications)
        setNotifications(data.data.notifications)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (view === 'dashboard') {
      setLoading(true)
      fetchDashboard()
    }
  }, [view, fetchDashboard])

  if (view !== 'dashboard') {
    const placeholders: Record<Exclude<View, 'dashboard'>, { title: string; description: string }> = {
      applications: { title: 'Applications', description: 'View and manage land allotment applications, track status, and process approvals.' },
      'land-parcels': { title: 'Land Parcels', description: 'Browse and manage land parcels across zones, check availability and status.' },
      payments: { title: 'Payments', description: 'Track payments, manage invoices, process refunds and penalties.' },
      constructions: { title: 'Construction Monitoring', description: 'Monitor construction progress, track milestones, and ensure compliance.' },
      grievances: { title: 'Grievances', description: 'Handle investor grievances, track resolution, and manage appeals.' },
      users: { title: 'User Management', description: 'Manage system users, roles, and permissions.' },
    }
    const p = placeholders[view]
    return <PlaceholderView title={p.title} description={p.description} />
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-16" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of APCRDA land management system</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={stats?.applications.total ?? 0}
          description={`${stats?.applications.pending ?? 0} pending review`}
          icon={FileText}
          trend="neutral"
        />
        <StatCard
          title="Land Parcels"
          value={stats?.landParcels.total ?? 0}
          description={`${stats?.landParcels.available ?? 0} available`}
          icon={LandPlot}
          trend="neutral"
        />
        <StatCard
          title="Revenue Collected"
          value={formatCurrency(stats?.payments.totalRevenue ?? 0)}
          description={stats?.payments.overdueCount > 0 ? `${stats.payments.overdueCount} overdue payments` : undefined}
          icon={IndianRupee}
          trend={stats?.payments.overdueCount > 0 ? 'down' : 'up'}
        />
        <StatCard
          title="Active Constructions"
          value={stats?.constructions.active ?? 0}
          icon={HardHat}
          trend="up"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Approved"
          value={stats?.applications.approved ?? 0}
          icon={CheckCircle2}
          trend="up"
        />
        <StatCard
          title="Rejected"
          value={stats?.applications.rejected ?? 0}
          icon={XCircle}
          trend="down"
        />
        <StatCard
          title="Pending Review"
          value={stats?.applications.pending ?? 0}
          icon={Clock}
          trend="neutral"
        />
        <StatCard
          title="Open Grievances"
          value={stats?.grievances.open ?? 0}
          icon={MessageSquareWarning}
          trend={stats?.grievances.open > 0 ? 'down' : 'up'}
        />
      </div>

      {/* Recent Applications & Notifications */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Applications</CardTitle>
            <CardDescription>Latest land allotment applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentApps.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No applications yet</p>
              ) : (
                recentApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{app.projectName || app.applicationNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {app.applicant?.organizationName}{app.landParcel ? ` · Plot ${app.landParcel.plotId}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge status={app.status} />
                      <span className="text-[10px] text-muted-foreground">{formatDate(app.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>Recent activity alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className={`rounded-lg border p-3 ${!notif.isRead ? 'bg-muted/50 border-primary/20' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <Badge variant={notif.isRead ? 'outline' : 'default'} className="text-[10px] shrink-0">
                        {notif.isRead ? 'Read' : 'New'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">{formatDate(notif.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
