'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAppLayout, type View } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, Cell, PieChart, Pie, ResponsiveContainer } from 'recharts'
import {
  FileText, LandPlot, IndianRupee, HardHat, MessageSquareWarning,
  TrendingUp, TrendingDown, ArrowUpRight, Clock, CheckCircle2, XCircle,
  AlertTriangle, Activity, ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  id: string; type: string; title: string; message: string; isRead: boolean; createdAt: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const cls = (() => {
    switch (status) {
      case 'Approved': case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'Submitted': case 'Under Review': case 'In Progress': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-600 border-slate-200'
    }
  })()
  return <Badge variant="outline" className={cn('text-[11px] font-medium', cls)}>{status}</Badge>
}

// Colored stat tile component
function StatTile({ title, value, description, icon: Icon, color, trend }: {
  title: string; value: string | number; description?: string
  icon: React.ElementType; color: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'slate'
  trend?: 'up' | 'down' | 'neutral'
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconText: 'text-blue-600', border: 'border-blue-100' },
    emerald: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', border: 'border-emerald-100' },
    violet: { bg: 'bg-violet-50', iconBg: 'bg-violet-100', iconText: 'text-violet-600', border: 'border-violet-100' },
    amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconText: 'text-amber-600', border: 'border-amber-100' },
    rose: { bg: 'bg-rose-50', iconBg: 'bg-rose-100', iconText: 'text-rose-600', border: 'border-rose-100' },
    slate: { bg: 'bg-slate-50', iconBg: 'bg-slate-100', iconText: 'text-slate-600', border: 'border-slate-100' },
  }
  const c = colorMap[color]
  return (
    <Card className={cn('border', c.border)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {trend === 'up' && <TrendingUp className="h-3 w-3 text-emerald-600" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                {description}
              </p>
            )}
          </div>
          <div className={cn('rounded-xl p-2.5', c.iconBg)}>
            <Icon className={cn('h-5 w-5', c.iconText)} />
          </div>
        </div>
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

const statusChartConfig = {
  approved: { label: 'Approved', color: 'oklch(0.62 0.17 160)' },
  pending: { label: 'Pending', color: 'oklch(0.72 0.16 75)' },
  rejected: { label: 'Rejected', color: 'oklch(0.60 0.20 25)' },
  other: { label: 'Other', color: 'oklch(0.70 0.01 250)' },
}

export function DashboardView() {
  const { view, navigateTo } = useAppLayout()
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
    } catch { /* silent */ } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (view === 'dashboard') { setLoading(true); fetchDashboard() }
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

  // Chart data
  const barData = stats ? [
    { name: 'Approved', value: stats.applications.approved, fill: 'oklch(0.62 0.17 160)' },
    { name: 'Pending', value: stats.applications.pending, fill: 'oklch(0.72 0.16 75)' },
    { name: 'Rejected', value: stats.applications.rejected, fill: 'oklch(0.60 0.20 25)' },
    { name: 'Others', value: Math.max(0, stats.applications.total - stats.applications.approved - stats.applications.pending - stats.applications.rejected), fill: 'oklch(0.85 0.01 250)' },
  ] : []

  const pieData = stats ? [
    { name: 'Available', value: stats.landParcels.available, fill: 'oklch(0.62 0.17 160)' },
    { name: 'Allotted', value: stats.landParcels.total - stats.landParcels.available, fill: 'oklch(0.55 0.18 250)' },
  ] : []

  const pieConfig = {
    available: { label: 'Available', color: 'oklch(0.62 0.17 160)' },
    allotted: { label: 'Allotted', color: 'oklch(0.55 0.18 250)' },
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-72" /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-16" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of Land Quantum management system</p>
      </div>

      {/* Stat Tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile title="Total Applications" value={stats?.applications.total ?? 0}
          description={`${stats?.applications.pending ?? 0} pending review`} icon={FileText} color="blue" />
        <StatTile title="Land Parcels" value={stats?.landParcels.total ?? 0}
          description={`${stats?.landParcels.available ?? 0} available`} icon={LandPlot} color="emerald" />
        <StatTile title="Revenue Collected" value={formatCurrency(stats?.payments.totalRevenue ?? 0)}
          description={stats?.payments.overdueCount > 0 ? `${stats.payments.overdueCount} overdue` : 'All on track'}
          icon={IndianRupee} color="violet" trend={stats?.payments.overdueCount > 0 ? 'down' : 'up'} />
        <StatTile title="Active Projects" value={stats?.constructions.active ?? 0}
          description={stats?.grievances.open > 0 ? `${stats.grievances.open} grievances` : 'No grievances'}
          icon={HardHat} color="amber" trend={stats?.grievances.open > 0 ? 'down' : 'up'} />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile title="Approved" value={stats?.applications.approved ?? 0}
          icon={CheckCircle2} color="emerald" trend="up" />
        <StatTile title="Pending Review" value={stats?.applications.pending ?? 0}
          icon={Clock} color="amber" />
        <StatTile title="Open Grievances" value={stats?.grievances.open ?? 0}
          icon={MessageSquareWarning} color="rose" trend={stats?.grievances.open > 0 ? 'down' : 'up'} />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Applications by Status Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Applications by Status</CardTitle>
            <CardDescription>Distribution of application statuses</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={statusChartConfig} className="h-[220px] w-full">
              <BarChart data={barData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Land Parcels Donut */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Land Availability</CardTitle>
            <CardDescription>Parcels by status</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex items-center justify-center">
            <ChartContainer config={pieConfig} className="h-[220px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  strokeWidth={3}
                  stroke="white"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications & Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Recent Applications</CardTitle>
                <CardDescription>Latest land allotment applications</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigateTo('applications')}>
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentApps.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No applications yet</p>
              ) : (
                recentApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between gap-4 rounded-lg border p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigateTo('application-detail', { id: app.id })}>
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

        {/* Activity Feed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Activity Feed</CardTitle>
            <CardDescription>Recent system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${!notif.isRead ? 'bg-primary/[0.03] border-primary/15' : ''}`}>
                    <div className="mt-0.5 rounded-full bg-muted p-1.5 shrink-0">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs leading-snug ${!notif.isRead ? 'font-medium' : 'text-muted-foreground'}`}>{notif.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">{formatDate(notif.createdAt)}</p>
                    </div>
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
